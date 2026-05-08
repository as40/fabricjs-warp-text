/**
 * fabric-warp-text.js
 * A custom Fabric.js plugin to apply various text warp effects.
 * Supports: Arch, Bulge, Flag, Roof, and Valley.
 */

(function (global) {
  var fabric = global.fabric || (global.fabric = require("fabric").fabric);

  fabric.WarpText = fabric.util.createClass(fabric.Text, {
    type: "warpText",

    // Defaults
    effect: "arch", // arch, bulge, flag, roof, valley
    curve: 110, // Intensity of the effect
    textHeight: 64, // Base visual height of the warp

    // Internal cache
    _sourceWidth: 0,
    _sourceHeight: 0,
    _sourceAscent: 0,
    _renderOffsetY: 0,

    initialize: function (text, options) {
      options = options || {};
      this.callSuper("initialize", text, options);

      this.set("effect", options.effect || "arch");
      this.set("curve", options.curve !== undefined ? options.curve : 110);
      this.set(
        "textHeight",
        options.textHeight !== undefined ? options.textHeight : 64,
      );

      this._osCanvas = document.createElement("canvas");
      this.objectCaching = false;
    },

    initDimensions: function () {
      this.callSuper("initDimensions");

      var tempCanvas = fabric.util.createCanvasElement();
      var ctx = tempCanvas.getContext("2d");
      ctx.font = this._getFontDeclaration();
      var metrics = ctx.measureText(this.text);

      var actualH, actualAscent;

      if (metrics.actualBoundingBoxAscent !== undefined) {
        actualAscent = metrics.actualBoundingBoxAscent;
        var actualDescent = metrics.actualBoundingBoxDescent;
        actualH = actualAscent + actualDescent + 2;
        this._sourceAscent = Math.ceil(actualAscent) + 1;
      } else {
        actualH = this.fontSize * 1.2;
        this._sourceAscent = Math.ceil(this.fontSize);
      }

      this._sourceWidth = Math.ceil(metrics.width) || this.width;
      this._sourceHeight = Math.ceil(actualH);

      this._updateWarpBounds();
    },

    _set: function (key, value) {
      this.callSuper("_set", key, value);
      if (
        [
          "effect",
          "curve",
          "textHeight",
          "text",
          "fontFamily",
          "fontSize",
          "fontWeight",
        ].includes(key)
      ) {
        if (["text", "fontFamily", "fontSize", "fontWeight"].includes(key)) {
          this.initDimensions();
        } else {
          this._updateWarpBounds();
        }
      }
      return this;
    },

    _getWarpGeometry: function (x, width) {
      var effect = this.effect;
      var curve = this.curve;
      var textHeight = this.textHeight;

      var normX = x / width;
      var angle = normX * Math.PI;

      var yShift = 0;
      var targetHeight = textHeight;

      switch (effect) {
        case "arch":
          var factor = Math.sin(angle);
          targetHeight = textHeight + curve * factor;
          yShift = textHeight - targetHeight;
          break;
        case "valley":
          var factor = Math.sin(angle);
          targetHeight = textHeight + curve * factor;
          yShift = 0;
          break;
        case "bulge":
          var factor = Math.sin(angle);
          targetHeight = textHeight + curve * factor;
          yShift = (textHeight - targetHeight) / 2;
          break;
        case "roof":
          var factor =
            x < width / 2 ? (2 * x) / width : (2 * (width - x)) / width;
          targetHeight = textHeight + curve * factor;
          yShift = textHeight - targetHeight;
          break;
        case "flag":
          var freq = 2;
          yShift = curve * Math.sin(normX * Math.PI * 2 * freq) * 0.5;
          targetHeight = textHeight;
          break;
        default:
          targetHeight = textHeight;
      }
      return { yShift: yShift, height: targetHeight };
    },

    _updateWarpBounds: function () {
      if (!this._sourceWidth || !this._sourceHeight) return;

      var w = Math.ceil(this._sourceWidth);
      var minY = Infinity,
        maxY = -Infinity;

      for (var i = 0; i < w; i++) {
        var geom = this._getWarpGeometry(i, w);
        var top = geom.yShift;
        var bottom = top + geom.height;

        if (top < minY) minY = top;
        if (bottom > maxY) maxY = bottom;
      }

      this.height = Math.abs(maxY - minY);
      this.width = w;
      this._renderOffsetY = -this.height / 2 - minY;

      this.setCoords();
    },

    _render: function (ctx) {
      if (this.width === 0 || this.height === 0) return;

      var w = Math.ceil(this._sourceWidth);
      var h = Math.ceil(this._sourceHeight);

      var retina = window.devicePixelRatio || 1;
      var resX = Math.abs(this.scaleX || 1) * retina;
      var resY = Math.abs(this.scaleY || 1) * retina;

      var maxDim = 4000;
      if (w * resX > maxDim) resX = maxDim / w;
      if (h * resY > maxDim) resY = maxDim / h;

      resX = Math.max(1, resX);
      resY = Math.max(1, resY);

      var osW = Math.ceil(w * resX);
      var osH = Math.ceil(h * resY);

      if (!this._osCanvas) this._osCanvas = document.createElement("canvas");
      var os = this._osCanvas;
      var octx = os.getContext("2d");

      os.width = osW;
      os.height = osH;

      octx.scale(resX, resY);
      octx.font = this._getFontDeclaration();
      octx.fillStyle = this.fill;
      octx.textBaseline = "alphabetic";
      octx.textAlign = "center";
      octx.fillText(this.text, w / 2, this._sourceAscent);

      var startX = -this.width / 2;
      var destWidth = 1 / resX;
      var overlap = destWidth * 0.5;

      for (var i = 0; i < osW; i++) {
        var unscaledX = i / resX;
        var geom = this._getWarpGeometry(unscaledX, w);

        var destX = startX + unscaledX;
        var destY = geom.yShift + this._renderOffsetY;
        var destH = geom.height;

        if (destH > 0.05) {
          try {
            ctx.drawImage(
              os,
              i,
              0,
              1,
              osH,
              destX,
              destY,
              destWidth + overlap,
              destH,
            );
          } catch (e) {}
        }
      }
    },

    toObject: function () {
      return fabric.util.object.extend(this.callSuper("toObject"), {
        effect: this.effect,
        curve: this.curve,
        textHeight: this.textHeight,
      });
    },
  });

  fabric.WarpText.fromObject = function (object, callback) {
    return fabric.Object._fromObject("WarpText", object, callback, "text");
  };
})(typeof exports !== "undefined" ? exports : this);
