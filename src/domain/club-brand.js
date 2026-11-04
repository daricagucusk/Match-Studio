// Club colors are user-editable suggestions, never official identity claims.
const DEFAULT_PRIMARY = '#176B46';
const LIGHT_NEUTRAL = '#F2F4F3';
const DARK_NEUTRAL = '#151A21';

function hexColor(value){
  return typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value) ? value.toUpperCase() : null;
}

function channels(hex){
  return [1, 3, 5].map(offset => parseInt(hex.slice(offset, offset + 2), 16));
}

function luminance(rgb){
  const linear = rgb.map(value => {
    const channel = value / 255;
    return channel <= 0.04045 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
  });
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
}

function readableInk(hex){
  const light = luminance(channels(hex));
  return (light + 0.05) / 0.05 >= 1.05 / (light + 0.05) ? '#000000' : '#FFFFFF';
}

function neutralPartner(hex){
  return readableInk(hex) === '#FFFFFF' ? LIGHT_NEUTRAL : DARK_NEUTRAL;
}

function normalizeClubPalette(club){
  const identity = club && typeof club === 'object' ? club : {};
  const primary = hexColor(identity.accent) || DEFAULT_PRIMARY;
  let secondary = hexColor(identity.secondaryAccent);
  if(!secondary || secondary === primary) secondary = neutralPartner(primary);
  return {
    primary,
    secondary,
    onPrimary: readableInk(primary),
    onSecondary: readableInk(secondary),
    primaryRgb: channels(primary).join(', '),
    secondaryRgb: channels(secondary).join(', ')
  };
}

function colorHex(rgb){
  return '#' + rgb.map(value => Math.round(value).toString(16).padStart(2, '0')).join('').toUpperCase();
}

function distance(a, b){
  return Math.sqrt(a.reduce((sum, value, index) => sum + Math.pow(value - b[index], 2), 0));
}

// Analyze a bounded sample locally; alpha-zero canvas backgrounds never vote.
function extractLogoPalette(imageData){
  if(!imageData || !Number.isSafeInteger(imageData.width) || !Number.isSafeInteger(imageData.height)
    || imageData.width <= 0 || imageData.height <= 0 || !imageData.data) return null;
  const pixels = imageData.width * imageData.height;
  if(!Number.isSafeInteger(pixels) || imageData.data.length < pixels * 4) return null;
  const data = imageData.data;
  const stride = Math.max(1, Math.ceil(pixels / 16384));
  const buckets = new Map();
  let total = 0;
  for(let pixel = 0; pixel < pixels; pixel += stride){
    const offset = pixel * 4;
    const [red, green, blue, alpha] = [data[offset], data[offset + 1], data[offset + 2], data[offset + 3]];
    if(![red, green, blue, alpha].every(value => Number.isFinite(value) && value >= 0 && value <= 255)
      || alpha < 128) continue;
    const key = (red >> 5) * 64 + (green >> 5) * 8 + (blue >> 5);
    let bucket = buckets.get(key);
    if(!bucket){ bucket = {count: 0, sums: [0, 0, 0]}; buckets.set(key, bucket); }
    bucket.count++;
    bucket.sums[0] += red;
    bucket.sums[1] += green;
    bucket.sums[2] += blue;
    total++;
  }
  if(!total) return null;
  const colors = Array.from(buckets.values()).map(bucket => {
    const rgb = bucket.sums.map(value => value / bucket.count);
    const max = Math.max(...rgb), min = Math.min(...rgb);
    return {rgb, count: bucket.count, saturation: max ? (max - min) / max : 0, spread: max - min};
  }).sort((a, b) => b.count - a.count);
  // A visible chromatic area is preferred to a large white/black logo surround.
  const chromatic = colors.filter(color => color.count >= total * 0.03 && color.saturation >= 0.3 && color.spread >= 40);
  chromatic.sort((a, b) => b.count * (0.5 + b.saturation) - a.count * (0.5 + a.saturation));
  const first = chromatic[0] || colors[0];
  const candidates = colors.filter(color => color !== first && color.count >= total * 0.03 && distance(color.rgb, first.rgb) >= 70);
  candidates.sort((a, b) => b.count * distance(b.rgb, first.rgb) - a.count * distance(a.rgb, first.rgb));
  const primary = colorHex(first.rgb);
  const secondary = candidates.length ? colorHex(candidates[0].rgb) : neutralPartner(primary);
  return {primary, secondary};
}

Object.assign(exports, {normalizeClubPalette, extractLogoPalette});
