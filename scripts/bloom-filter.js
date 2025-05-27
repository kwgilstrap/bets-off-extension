// Bets Off - Bloom Filter Implementation
// Efficient domain lookup with minimal memory footprint

class BloomFilter {
  constructor(size = 1024 * 64, hashFunctions = 6) {
    this.size = size; // 64KB default size
    this.hashFunctions = hashFunctions;
    this.bitArray = new Uint8Array(Math.ceil(size / 8));
  }

  // Add item to the filter
  add(item) {
    const positions = this._getPositions(item);
    for (const pos of positions) {
      const bytePos = Math.floor(pos / 8);
      const bitPos = pos % 8;
      this.bitArray[bytePos] |= (1 << bitPos);
    }
  }

  // Check if item might be in the filter
  test(item) {
    const positions = this._getPositions(item);
    for (const pos of positions) {
      const bytePos = Math.floor(pos / 8);
      const bitPos = pos % 8;
      if ((this.bitArray[bytePos] & (1 << bitPos)) === 0) {
        return false; // Definitely not in the filter
      }
    }
    return true; // Might be in the filter
  }

  // Add multiple items
  addAll(items) {
    for (const item of items) {
      this.add(item);
    }
  }

  // Generate hash positions for an item
  _getPositions(item) {
    const positions = [];
    // Use different seed values for each hash function
    for (let i = 0; i < this.hashFunctions; i++) {
      const hash = this._murmurhash3_32_gc(item, i);
      positions.push(hash % this.size);
    }
    return positions;
  }

  // MurmurHash3 implementation (fast hash function)
  _murmurhash3_32_gc(key, seed = 0) {
    let remainder, bytes, h1, h1b, c1, c2, k1, i;

    remainder = key.length & 3; // key.length % 4
    bytes = key.length - remainder;
    h1 = seed;
    c1 = 0xcc9e2d51;
    c2 = 0x1b873593;
    i = 0;

    while (i < bytes) {
      k1 =
        ((key.charCodeAt(i) & 0xff)) |
        ((key.charCodeAt(++i) & 0xff) << 8) |
        ((key.charCodeAt(++i) & 0xff) << 16) |
        ((key.charCodeAt(++i) & 0xff) << 24);
      ++i;

      k1 = ((k1 & 0xffff) * c1 + ((((k1 >>> 16) * c1) & 0xffff) << 16)) & 0xffffffff;
      k1 = (k1 << 15) | (k1 >>> 17);
      k1 = ((k1 & 0xffff) * c2 + ((((k1 >>> 16) * c2) & 0xffff) << 16)) & 0xffffffff;

      h1 ^= k1;
      h1 = (h1 << 13) | (h1 >>> 19);
      h1b = ((h1 & 0xffff) * 5 + ((((h1 >>> 16) * 5) & 0xffff) << 16)) & 0xffffffff;
      h1 = (h1b & 0xffff) + 0x6b64 + ((((h1b >>> 16) + 0xe654) & 0xffff) << 16);
    }

    k1 = 0;

    switch (remainder) {
      case 3: k1 ^= (key.charCodeAt(i + 2) & 0xff) << 16;
      case 2: k1 ^= (key.charCodeAt(i + 1) & 0xff) << 8;
      case 1: k1 ^= (key.charCodeAt(i) & 0xff);
              k1 = ((k1 & 0xffff) * c1 + ((((k1 >>> 16) * c1) & 0xffff) << 16)) & 0xffffffff;
              k1 = (k1 << 15) | (k1 >>> 17);
              k1 = ((k1 & 0xffff) * c2 + ((((k1 >>> 16) * c2) & 0xffff) << 16)) & 0xffffffff;
              h1 ^= k1;
    }

    h1 ^= key.length;

    h1 ^= h1 >>> 16;
    h1 = ((h1 & 0xffff) * 0x85ebca6b + ((((h1 >>> 16) * 0x85ebca6b) & 0xffff) << 16)) & 0xffffffff;
    h1 ^= h1 >>> 13;
    h1 = ((h1 & 0xffff) * 0xc2b2ae35 + ((((h1 >>> 16) * 0xc2b2ae35) & 0xffff) << 16)) & 0xffffffff;
    h1 ^= h1 >>> 16;

    return h1 >>> 0;
  }

  // Serialize the bloom filter to JSON
  serialize() {
    return {
      size: this.size,
      hashFunctions: this.hashFunctions,
      bitArray: Array.from(this.bitArray)
    };
  }

  // Create a bloom filter from serialized data
  static deserialize(data) {
    const filter = new BloomFilter(data.size, data.hashFunctions);
    filter.bitArray = new Uint8Array(data.bitArray);
    return filter;
  }
}

// Example usage for background script
// const adDomains = new BloomFilter();
// adDomains.addAll(['doubleclick.net', 'googlesyndication.com', 'adservice.google.com']);
// 
// chrome.webRequest.onBeforeRequest.addListener(
//   function(details) {
//     const url = new URL(details.url);
//     const domain = url.hostname;
//     
//     if (adDomains.test(domain)) {
//       return { cancel: true };
//     }
//     return { cancel: false };
//   },
//   { urls: ["<all_urls>"] },
//   ["blocking"]
// );

export default BloomFilter;