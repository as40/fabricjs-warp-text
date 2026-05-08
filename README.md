# Fabric.js Warp Text Plugin

A powerful, high-resolution text warping plugin for Fabric.js. This plugin extends the native `fabric.Text` class to add Adobe Illustrator-style warp effects without losing vector-like crispness during scaling.

## Demo

_(Add a link to your live demo here once published via GitHub pages!)_

## Features

- **5 Built-in Effects**: Arch, Bulge, Flag, Roof, and Valley.
- **Crisp Scaling**: Dynamically recalculates rendering resolution when scaled to prevent pixelation.
- **Tight Bounding Boxes**: Selection boxes accurately hug the newly warped shapes.
- **JSON Serialization**: Fully supports `toJSON()` and `loadFromJSON()`.

## Installation

Simply include the `fabric-warp-text.js` file in your project _after_ loading Fabric.js.

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.1/fabric.min.js"></script>
<script src="path/to/fabric-warp-text.js"></script>
```

```javascript
// Initialize your Canvas
var canvas = new fabric.Canvas("canvas");

// Create a WarpText object
var warpText = new fabric.WarpText("HELLO WORLD", {
  fontFamily: "Arial",
  fontSize: 80,
  fill: "#ff0000",
  // Plugin Specific Options:
  effect: "arch", // 'arch', 'bulge', 'flag', 'roof', 'valley'
  curve: 80, // Intensity/Strength of the curve (can be negative)
  textHeight: 100, // The base vertical height of the warp effect
});

// Add to canvas
canvas.add(warpText);
```

| Property     | Type   | Default  | Description                                                                            |
| ------------ | ------ | -------- | -------------------------------------------------------------------------------------- |
| `effect`     | String | `'arch'` | The shape of the warp (`arch`, `bulge`, `flag`, `roof`, `valley`).                     |
| `curve`      | Number | `110`    | The intensity of the effect. Negative values invert the effect.                        |
| `textHeight` | Number | `64`     | The visual height mapping. Useful to control stretching independently from `fontSize`. |
