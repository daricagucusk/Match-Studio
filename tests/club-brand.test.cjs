const {test} = require('node:test');
const assert = require('node:assert/strict');
const {createLoader} = require('./loader.cjs');
const {normalizeClubPalette, extractLogoPalette} = createLoader().load('src/domain/club-brand.js');

function pixels(...groups){
  const values = groups.flatMap(([rgba, count]) => Array.from({length: count}, () => rgba).flat());
  return {width: values.length / 4, height: 1, data: new Uint8ClampedArray(values)};
}

test('legacy accent is retained and receives a neutral second color without mutation', () => {
  const club = Object.freeze({name: 'Test Club', accent: '#176b46'});
  const palette = normalizeClubPalette(club);
  assert.equal(palette.primary, '#176B46');
  assert.equal(palette.secondary, '#F2F4F3');
  assert.equal(palette.onPrimary, '#FFFFFF');
  assert.equal(palette.onSecondary, '#000000');
  assert.equal(palette.primaryRgb, '23, 107, 70');
  assert.equal(palette.secondaryRgb, '242, 244, 243');
  assert.equal(club.secondaryAccent, undefined);
});

test('explicit dual colors survive normalization and use legible foregrounds', () => {
  const palette = normalizeClubPalette({accent: '#ffffff', secondaryAccent: '#000000'});
  assert.equal(palette.primary, '#FFFFFF');
  assert.equal(palette.secondary, '#000000');
  assert.equal(palette.onPrimary, '#000000');
  assert.equal(palette.onSecondary, '#FFFFFF');
});

test('invalid, missing and duplicate colors receive safe distinct defaults', () => {
  for(const club of [null, undefined, {}, {accent: 'red'}, {accent: '#fff'}, {accent: '#123456;background:url(x)', secondaryAccent: 'invalid'}]){
    const result = normalizeClubPalette(club);
    assert.equal(result.primary, '#176B46');
    assert.equal(result.secondary, '#F2F4F3');
  }
  assert.equal(normalizeClubPalette({accent: '#ffffff', secondaryAccent: '#FFFFFF'}).secondary, '#151A21');
});

test('transparent pixels and faint antialias pixels do not supply logo colors', () => {
  const image = pixels([[255, 0, 0, 0], 100], [[255, 0, 255, 100], 100], [[0, 128, 0, 255], 12], [[0, 0, 0, 255], 8]);
  const result = extractLogoPalette(image);
  assert.equal(result.primary, '#008000');
  assert.equal(result.secondary, '#000000');
});

test('green-black logo retains its real secondary instead of inventing gold', () => {
  const result = extractLogoPalette(pixels([[0, 140, 70, 255], 25], [[0, 0, 0, 255], 70], [[240, 240, 240, 255], 5]));
  assert.equal(result.primary, '#008C46');
  assert.equal(result.secondary, '#000000');
});

test('red-white logo chooses its red detail and real white secondary', () => {
  const result = extractLogoPalette(pixels([[210, 15, 35, 255], 30], [[255, 255, 255, 255], 70]));
  assert.equal(result.primary, '#D20F23');
  assert.equal(result.secondary, '#FFFFFF');
});

test('monochrome and empty logos have deterministic neutral outcomes', () => {
  assert.equal(extractLogoPalette(pixels([[0, 0, 0, 255], 10])).secondary, '#F2F4F3');
  assert.equal(extractLogoPalette(pixels([[255, 255, 255, 255], 10])).secondary, '#151A21');
  assert.equal(extractLogoPalette(pixels([[0, 255, 0, 0], 20])), null);
  for(const input of [null, {}, {width: 0, height: 1, data: []}, {width: 1.5, height: 1, data: [0, 0, 0, 255]}, {width: 2, height: 1, data: [0, 0, 0, 255]}]){
    assert.equal(extractLogoPalette(input), null);
  }
});
