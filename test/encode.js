const fs = require("fs");
const path = require("path");
const assert = require("assert");
const encoder = require("..");

const testSpec = [
  { opts: { bitDepth:  8 }, delta: 1e-1, filename: "amen_pcm8.wav" },
  { opts: { bitDepth: 16 }, delta: 1e-4, filename: "amen_pcm16.wav" },
  { opts: { bitDepth: 24 }, delta: 1e-6, filename: "amen_pcm24.wav" },
  { opts: { bitDepth: 32 }, delta: 1e-8, filename: "amen_pcm32.wav" },
  { opts: { float:  true }, delta: 0.00, filename: "amen_pcm32f.wav" }
];

function readFile(filename) {
  return fs.readFileSync(path.join(__dirname, "fixtures", filename));
}

function readAudioData(filename) {
  const buffer = readFile(filename).buffer;

  const uint32 = new Uint32Array(buffer, 4);
  const float32 = new Float32Array(buffer, 16);

  const numberOfChannels = uint32[0];
  const length = uint32[1];
  const sampleRate = uint32[2];
  const channelData = new Array(numberOfChannels).fill().map((_, ch) => {
    return float32.subarray(ch * length, (ch + 1) * length);
  });

  return {
    numberOfChannels: numberOfChannels,
    length: length,
    sampleRate: sampleRate,
    channelData: channelData
  };
}

describe("encode(audioData, opts)", () => {
  const audioData = readAudioData("amen.dat");

  testSpec.forEach(({ opts, delta, filename }) => {
    it(filename, () => {
      const expected = new Uint8Array(readFile(filename));

      return encoder.encode(audioData, opts).then((actual) => {
        actual = new Uint8Array(actual);

        assert.deepEqual(actual, expected);
      });
    });
  });
});
