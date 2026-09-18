/*
 * ================================================================
 * AHE Texture Engine
 * ================================================================
 *
 * Single File Edition
 *
 * Version: 0.3.0
 *
 * Pure JavaScript
 *
 * Compatible:
 *   - Browser
 *   - Android WebView
 *   - Chrome
 *   - Firefox
 *   - Edge
 *   - Node.js
 *   - Termux + Node.js
 *
 * Codecs:
 *   - RGBA8
 *   - BC1 / DXT1
 *   - BC2 / DXT3
 *   - BC3 / DXT5
 *   - BC4
 *   - BC5
 *
 * Containers:
 *   - DDS
 *
 * Image operations:
 *   - Resize
 *   - Crop
 *   - Flip
 *   - Rotate
 *   - Grayscale
 *   - Invert
 *   - Brightness
 *   - Contrast
 *   - Alpha
 *   - Premultiply Alpha
 *   - Unpremultiply Alpha
 *   - Mipmap
 *   - Difference Map
 *
 * Analysis:
 *   - Histogram
 *   - MSE
 *   - RMSE
 *   - MAE
 *   - PSNR
 *   - Entropy
 *   - Dominant Color
 *   - Memory
 *   - Compression Ratio
 *   - Alpha detection
 *
 * Architecture:
 *   - Codec registry
 *   - Plugin system
 *   - Async API
 *   - Format detection
 *
 * ================================================================
 */

(function (root, factory) {

    if (
        typeof module !== "undefined" &&
        module.exports
    ) {

        module.exports = factory();

    } else {

        root.AHETEX = factory();

    }

})(

    typeof globalThis !== "undefined"
        ? globalThis
        : this,

    function () {

    "use strict";


    /*
     * ============================================================
     * CONSTANTS
     * ============================================================
     */

    const VERSION = "0.3.0";


    const FORMATS = {

        RGBA8: "RGBA8",

        BC1: "BC1",
        DXT1: "BC1",

        BC2: "BC2",
        DXT3: "BC2",

        BC3: "BC3",
        DXT5: "BC3",

        BC4: "BC4",

        BC5: "BC5",

        BC6H: "BC6H",

        BC7: "BC7",

        ETC1: "ETC1",

        ETC2: "ETC2",

        ASTC: "ASTC",

        ATC: "ATC",

        KTX: "KTX",

        KTX2: "KTX2",

        DDS: "DDS"

    };


    const codecs = new Map();


    /*
     * ============================================================
     * BASIC HELPERS
     * ============================================================
     */

    function clamp(
        value,
        min,
        max
    ) {

        if (value < min)
            return min;

        if (value > max)
            return max;

        return value;
    }


    function clamp8(value) {

        return clamp(
            Math.round(value),
            0,
            255
        );
    }


    function toUint8Array(data) {

        if (
            data instanceof Uint8Array
        ) {

            return data;
        }


        if (
            data instanceof Uint8ClampedArray
        ) {

            return new Uint8Array(data);
        }


        if (
            typeof ArrayBuffer !== "undefined" &&
            data instanceof ArrayBuffer
        ) {

            return new Uint8Array(data);
        }


        if (
            typeof ArrayBuffer !== "undefined" &&
            ArrayBuffer.isView(data)
        ) {

            return new Uint8Array(
                data.buffer,
                data.byteOffset,
                data.byteLength
            );
        }


        throw new Error(
            "Data must be Uint8Array or ArrayBuffer."
        );
    }


    function readU16(
        data,
        offset
    ) {

        return (
            data[offset] |
            (
                data[offset + 1] << 8
            )
        ) >>> 0;
    }


    function readU32(
        data,
        offset
    ) {

        return (
            data[offset] |
            (
                data[offset + 1] << 8
            ) |
            (
                data[offset + 2] << 16
            ) |
            (
                data[offset + 3] << 24
            )
        ) >>> 0;
    }


    function writeU16(
        data,
        offset,
        value
    ) {

        data[offset] =
            value & 255;

        data[offset + 1] =
            (
                value >>> 8
            ) & 255;
    }


    function writeU32(
        data,
        offset,
        value
    ) {

        data[offset] =
            value & 255;

        data[offset + 1] =
            (
                value >>> 8
            ) & 255;

        data[offset + 2] =
            (
                value >>> 16
            ) & 255;

        data[offset + 3] =
            (
                value >>> 24
            ) & 255;
    }


    function fourCC(
        data,
        offset
    ) {

        return String.fromCharCode(

            data[offset],

            data[offset + 1],

            data[offset + 2],

            data[offset + 3]

        );
    }


    function makeFourCC(text) {

        const result =
            new Uint8Array(4);


        result[0] =
            text.charCodeAt(0);

        result[1] =
            text.charCodeAt(1);

        result[2] =
            text.charCodeAt(2);

        result[3] =
            text.charCodeAt(3);


        return result;
    }


    function isPowerOfTwo(value) {

        return (
            value > 0 &&
            (
                value &
                (
                    value - 1
                )
            ) === 0
        );
    }


    function nextPowerOfTwo(value) {

        value =
            Math.max(
                1,
                value | 0
            );


        let p = 1;


        while (p < value)
            p *= 2;


        return p;
    }


    /*
     * ============================================================
     * RGB565
     * ============================================================
     */

    function encode565(
        r,
        g,
        b
    ) {

        r = clamp8(r);
        g = clamp8(g);
        b = clamp8(b);


        return (

            (
                (
                    Math.round(
                        r * 31 / 255
                    ) & 31
                ) << 11
            ) |

            (
                (
                    Math.round(
                        g * 63 / 255
                    ) & 63
                ) << 5
            ) |

            (
                Math.round(
                    b * 31 / 255
                ) & 31
            )

        );
    }


    function decode565(value) {

        return [

            (
                (
                    value >> 11
                ) & 31
            ) * 255 / 31,

            (
                (
                    value >> 5
                ) & 63
            ) * 255 / 63,

            (
                value & 31
            ) * 255 / 31

        ];
    }


    function colorDistance(
        r1,
        g1,
        b1,
        r2,
        g2,
        b2
    ) {

        const dr =
            r1 - r2;

        const dg =
            g1 - g2;

        const db =
            b1 - b2;


        return (
            dr * dr +
            dg * dg +
            db * db
        );
    }


    /*
     * ============================================================
     * TEXTURE
     * ============================================================
     */

    class Texture {

        constructor(
            width,
            height,
            data,
            format
        ) {

            width =
                Number(width);

            height =
                Number(height);


            if (
                !Number.isInteger(width) ||
                width <= 0
            ) {

                throw new Error(
                    "Invalid texture width."
                );
            }


            if (
                !Number.isInteger(height) ||
                height <= 0
            ) {

                throw new Error(
                    "Invalid texture height."
                );
            }


            data =
                toUint8Array(data);


            if (
                data.length !==
                width *
                height *
                4
            ) {

                throw new Error(
                    "Invalid RGBA data size."
                );
            }


            this.width =
                width;

            this.height =
                height;

            this.data =
                new Uint8Array(data);

            this.format =
                format || "RGBA8";

            this.mipmaps =
                [];

            this.metadata =
                {};
        }


        clone() {

            const copy =
                new Texture(

                    this.width,

                    this.height,

                    this.data,

                    this.format

                );


            copy.metadata =
                Object.assign(
                    {},
                    this.metadata
                );


            copy.mipmaps =
                this.mipmaps.map(
                    function (mip) {
                        return mip.clone();
                    }
                );


            return copy;
        }


        byteLength() {

            return this.data.length;
        }


        memoryMB() {

            return (
                this.data.length /
                1024 /
                1024
            );
        }


        pixel(
            x,
            y
        ) {

            x = clamp(
                x | 0,
                0,
                this.width - 1
            );

            y = clamp(
                y | 0,
                0,
                this.height - 1
            );


            const p =
                (
                    y *
                    this.width +
                    x
                ) * 4;


            return [

                this.data[p],

                this.data[p + 1],

                this.data[p + 2],

                this.data[p + 3]

            ];
        }


        setPixel(
            x,
            y,
            r,
            g,
            b,
            a
        ) {

            if (
                x < 0 ||
                y < 0 ||
                x >= this.width ||
                y >= this.height
            ) {

                return;
            }


            const p =
                (
                    y *
                    this.width +
                    x
                ) * 4;


            this.data[p] =
                clamp8(r);

            this.data[p + 1] =
                clamp8(g);

            this.data[p + 2] =
                clamp8(b);

            this.data[p + 3] =
                clamp8(

                    a === undefined
                        ? 255
                        : a

                );
        }


        mipmap(options) {

            return generateMipmaps(
                this,
                options
            );
        }


        resize(
            width,
            height,
            filter
        ) {

            return resize(
                this,
                width,
                height,
                filter
            );
        }


        crop(
            x,
            y,
            width,
            height
        ) {

            return crop(
                this,
                x,
                y,
                width,
                height
            );
        }


        flipX() {

            return flipX(this);
        }


        flipY() {

            return flipY(this);
        }


        rotate(angle) {

            return rotate(
                this,
                angle
            );
        }


        analyze() {

            return analyze(this);
        }


        compressionInfo(format) {

            return compressionInfo(
                this,
                format
            );
        }
    }


    /*
     * ============================================================
     * BC1
     * ============================================================
     */

    const BC1 = {};


    BC1.name =
        "BC1";

    BC1.blockSize =
        8;


    function bc1Palette(
        c0,
        c1
    ) {

        const a =
            decode565(c0);

        const b =
            decode565(c1);


        const p = [];


        p.push([
            a[0],
            a[1],
            a[2],
            255
        ]);


        p.push([
            b[0],
            b[1],
            b[2],
            255
        ]);


        if (c0 > c1) {

            p.push([

                (
                    2 * a[0] +
                    b[0]
                ) / 3,

                (
                    2 * a[1] +
                    b[1]
                ) / 3,

                (
                    2 * a[2] +
                    b[2]
                ) / 3,

                255

            ]);


            p.push([

                (
                    a[0] +
                    2 * b[0]
                ) / 3,

                (
                    a[1] +
                    2 * b[1]
                ) / 3,

                (
                    a[2] +
                    2 * b[2]
                ) / 3,

                255

            ]);

        } else {

            p.push([

                (
                    a[0] +
                    b[0]
                ) / 2,

                (
                    a[1] +
                    b[1]
                ) / 2,

                (
                    a[2] +
                    b[2]
                ) / 2,

                255

            ]);


            p.push([
                0,
                0,
                0,
                0
            ]);
        }


        return p;
    }


    BC1.decode =
        function (
            data,
            width,
            height
        ) {

        data =
            toUint8Array(data);


        width |= 0;
        height |= 0;


        if (
            width <= 0 ||
            height <= 0
        ) {

            throw new Error(
                "Invalid BC1 dimensions."
            );
        }


        const blocksX =
            Math.ceil(
                width / 4
            );

        const blocksY =
            Math.ceil(
                height / 4
            );


        const required =
            blocksX *
            blocksY *
            8;


        if (
            data.length <
            required
        ) {

            throw new Error(
                "BC1 data is truncated."
            );
        }


        const out =
            new Uint8Array(
                width *
                height *
                4
            );


        let offset = 0;


        for (
            let by = 0;
            by < height;
            by += 4
        ) {

            for (
                let bx = 0;
                bx < width;
                bx += 4
            ) {

                const c0 =
                    readU16(
                        data,
                        offset
                    );

                const c1 =
                    readU16(
                        data,
                        offset + 2
                    );


                const palette =
                    bc1Palette(
                        c0,
                        c1
                    );


                const bits =
                    readU32(
                        data,
                        offset + 4
                    );


                for (
                    let py = 0;
                    py < 4;
                    py++
                ) {

                    for (
                        let px = 0;
                        px < 4;
                        px++
                    ) {

                        const x =
                            bx + px;

                        const y =
                            by + py;


                        if (
                            x >= width ||
                            y >= height
                        )
                            continue;


                        const i =
                            py * 4 + px;


                        const index =
                            (
                                bits >>>
                                (
                                    i * 2
                                )
                            ) & 3;


                        const color =
                            palette[index];


                        const p =
                            (
                                y *
                                width +
                                x
                            ) * 4;


                        out[p] =
                            clamp8(
                                color[0]
                            );

                        out[p + 1] =
                            clamp8(
                                color[1]
                            );

                        out[p + 2] =
                            clamp8(
                                color[2]
                            );

                        out[p + 3] =
                            color[3];
                    }
                }


                offset += 8;
            }
        }


        return new Texture(
            width,
            height,
            out,
            "RGBA8"
        );
    };


    BC1.encodeBlock =
        function (pixels) {

        let minR = 255;
        let minG = 255;
        let minB = 255;

        let maxR = 0;
        let maxG = 0;
        let maxB = 0;


        for (
            let i = 0;
            i < 64;
            i += 4
        ) {

            minR =
                Math.min(
                    minR,
                    pixels[i]
                );

            minG =
                Math.min(
                    minG,
                    pixels[i + 1]
                );

            minB =
                Math.min(
                    minB,
                    pixels[i + 2]
                );


            maxR =
                Math.max(
                    maxR,
                    pixels[i]
                );

            maxG =
                Math.max(
                    maxG,
                    pixels[i + 1]
                );

            maxB =
                Math.max(
                    maxB,
                    pixels[i + 2]
                );
        }


        let c0 =
            encode565(
                maxR,
                maxG,
                maxB
            );


        let c1 =
            encode565(
                minR,
                minG,
                minB
            );


        /*
         * BC1 encoder is forced into
         * four-color mode.
         */
        if (c0 <= c1) {

            const temp =
                c0;

            c0 =
                c1;

            c1 =
                temp;

        }


        if (c0 === c1) {

            if (c0 < 0xFFFF)
                c0++;

            else if (c1 > 0)
                c1--;
        }


        const palette =
            bc1Palette(
                c0,
                c1
            );


        let bits = 0;


        for (
            let i = 0;
            i < 16;
            i++
        ) {

            const p =
                i * 4;


            let best =
                0;

            let distance =
                Infinity;


            for (
                let j = 0;
                j < 4;
                j++
            ) {

                const d =
                    colorDistance(

                        pixels[p],

                        pixels[p + 1],

                        pixels[p + 2],

                        palette[j][0],

                        palette[j][1],

                        palette[j][2]

                    );


                if (
                    d < distance
                ) {

                    distance =
                        d;

                    best =
                        j;
                }
            }


            bits =
                (
                    bits |
                    (
                        best <<
                        (
                            i * 2
                        )
                    )
                ) >>> 0;
        }


        const out =
            new Uint8Array(8);


        writeU16(
            out,
            0,
            c0
        );

        writeU16(
            out,
            2,
            c1
        );

        writeU32(
            out,
            4,
            bits
        );


        return out;
    };


    BC1.encode =
        function (texture) {

        const width =
            texture.width;

        const height =
            texture.height;

        const src =
            texture.data;


        const blocksX =
            Math.ceil(
                width / 4
            );

        const blocksY =
            Math.ceil(
                height / 4
            );


        const out =
            new Uint8Array(

                blocksX *
                blocksY *
                8

            );


        let offset =
            0;


        for (
            let by = 0;
            by < height;
            by += 4
        ) {

            for (
                let bx = 0;
                bx < width;
                bx += 4
            ) {

                const pixels =
                    new Uint8Array(64);


                let pp = 0;


                for (
                    let py = 0;
                    py < 4;
                    py++
                ) {

                    for (
                        let px = 0;
                        px < 4;
                        px++
                    ) {

                        const x =
                            Math.min(
                                width - 1,
                                bx + px
                            );

                        const y =
                            Math.min(
                                height - 1,
                                by + py
                            );


                        const p =
                            (
                                y *
                                width +
                                x
                            ) * 4;


                        pixels[pp++] =
                            src[p];

                        pixels[pp++] =
                            src[p + 1];

                        pixels[pp++] =
                            src[p + 2];

                        pixels[pp++] =
                            src[p + 3];
                    }
                }


                out.set(

                    BC1.encodeBlock(
                        pixels
                    ),

                    offset

                );


                offset += 8;
            }
        }


        return out;
    };


    /*
     * ============================================================
     * BC2 / DXT3
     * ============================================================
     */

    const BC2 = {};


    BC2.name =
        "BC2";

    BC2.blockSize =
        16;


    BC2.decode =
        function (
            data,
            width,
            height
        ) {

        data =
            toUint8Array(data);


        const blocksX =
            Math.ceil(
                width / 4
            );

        const blocksY =
            Math.ceil(
                height / 4
            );


        const required =
            blocksX *
            blocksY *
            16;


        if (
            data.length <
            required
        ) {

            throw new Error(
                "BC2 data is truncated."
            );
        }


        const out =
            new Uint8Array(
                width *
                height *
                4
            );


        let offset =
            0;


        for (
            let by = 0;
            by < height;
            by += 4
        ) {

            for (
                let bx = 0;
                bx < width;
                bx += 4
            ) {

                /*
                 * DXT3 alpha:
                 * 16 pixels × 4 bit
                 */
                for (
                    let py = 0;
                    py < 4;
                    py++
                ) {

                    const alphaRow =
                        readU32(
                            data,
                            offset +
                            (
                                py * 2
                            )
                        );


                    for (
                        let px = 0;
                        px < 4;
                        px++
                    ) {

                        const x =
                            bx + px;

                        const y =
                            by + py;


                        if (
                            x >= width ||
                            y >= height
                        )
                            continue;


                        let nibble =
                            (
                                alphaRow >>>
                                (
                                    px * 4
                                )
                            ) & 15;


                        const alpha =
                            nibble * 17;


                        const p =
                            (
                                y *
                                width +
                                x
                            ) * 4;


                        out[p + 3] =
                            alpha;
                    }
                }


                const color =
                    BC1.decode(

                        data.slice(
                            offset + 8,
                            offset + 16
                        ),

                        4,
                        4

                    );


                for (
                    let py = 0;
                    py < 4;
                    py++
                ) {

                    for (
                        let px = 0;
                        px < 4;
                        px++
                    ) {

                        const x =
                            bx + px;

                        const y =
                            by + py;


                        if (
                            x >= width ||
                            y >= height
                        )
                            continue;


                        const sp =
                            (
                                py * 4 +
                                px
                            ) * 4;


                        const dp =
                            (
                                y *
                                width +
                                x
                            ) * 4;


                        out[dp] =
                            color.data[sp];

                        out[dp + 1] =
                            color.data[sp + 1];

                        out[dp + 2] =
                            color.data[sp + 2];
                    }
                }


                offset += 16;
            }
        }


        return new Texture(
            width,
            height,
            out,
            "RGBA8"
        );
    };


    BC2.encode =
        function (texture) {

        const width =
            texture.width;

        const height =
            texture.height;


        const blocksX =
            Math.ceil(
                width / 4
            );

        const blocksY =
            Math.ceil(
                height / 4
            );


        const out =
            new Uint8Array(

                blocksX *
                blocksY *
                16

            );


        let offset =
            0;


        for (
            let by = 0;
            by < height;
            by += 4
        ) {

            for (
                let bx = 0;
                bx < width;
                bx += 4
            ) {

                const pixels =
                    new Uint8Array(64);


                let pp =
                    0;


                for (
                    let py = 0;
                    py < 4;
                    py++
                ) {

                    let alphaBits =
                        0;


                    for (
                        let px = 0;
                        px < 4;
                        px++
                    ) {

                        const x =
                            Math.min(
                                width - 1,
                                bx + px
                            );

                        const y =
                            Math.min(
                                height - 1,
                                by + py
                            );


                        const p =
                            (
                                y *
                                width +
                                x
                            ) * 4;


                        pixels[pp++] =
                            texture.data[p];

                        pixels[pp++] =
                            texture.data[p + 1];

                        pixels[pp++] =
                            texture.data[p + 2];

                        pixels[pp++] =
                            texture.data[p + 3];


                        const alpha4 =
                            Math.round(
                                texture.data[
                                    p + 3
                                ] / 17
                            ) & 15;


                        alphaBits |=
                            alpha4 <<
                            (
                                px * 4
                            );
                    }


                    writeU32(
                        out,
                        offset +
                        py * 2,
                        alphaBits
                    );
                }


                /*
                 * DXT3 color portion.
                 *
                 * BC1 is forced into
                 * four-color mode.
                 */
                const color =
                    BC1.encodeBlock(
                        pixels
                    );


                out.set(
                    color,
                    offset + 8
                );


                offset += 16;
            }
        }


        return out;
    };


    /*
     * ============================================================
     * BC3 / DXT5
     * ============================================================
     */

    const BC3 = {};


    BC3.name =
        "BC3";

    BC3.blockSize =
        16;


    function alphaPalette(
        a0,
        a1
    ) {

        const p =
            new Uint8Array(8);


        p[0] =
            a0;

        p[1] =
            a1;


        if (
            a0 > a1
        ) {

            p[2] =
                (
                    6 * a0 +
                    a1
                ) / 7;

            p[3] =
                (
                    5 * a0 +
                    2 * a1
                ) / 7;

            p[4] =
                (
                    4 * a0 +
                    3 * a1
                ) / 7;

            p[5] =
                (
                    3 * a0 +
                    4 * a1
                ) / 7;

            p[6] =
                (
                    2 * a0 +
                    5 * a1
                ) / 7;

            p[7] =
                (
                    a0 +
                    6 * a1
                ) / 7;

        } else {

            p[2] =
                (
                    4 * a0 +
                    a1
                ) / 5;

            p[3] =
                (
                    3 * a0 +
                    2 * a1
                ) / 5;

            p[4] =
                (
                    2 * a0 +
                    3 * a1
                ) / 5;

            p[5] =
                (
                    a0 +
                    4 * a1
                ) / 5;

            p[6] =
                0;

            p[7] =
                255;
        }


        for (
            let i = 0;
            i < 8;
            i++
        ) {

            p[i] =
                clamp8(
                    p[i]
                );
        }


        return p;
    }


    function readAlphaIndex(
        data,
        offset,
        index
    ) {

        const bit =
            index * 3;

        const byte =
            bit >> 3;

        const shift =
            bit & 7;


        const value =
            data[offset + byte] |
            (
                data[offset + byte + 1]
                << 8
            ) |
            (
                data[offset + byte + 2]
                << 16
            );


        return (
            value >>>
            shift
        ) & 7;
    }


    BC3.decode =
        function (
            data,
            width,
            height
        ) {

        data =
            toUint8Array(data);


        const blocksX =
            Math.ceil(
                width / 4
            );

        const blocksY =
            Math.ceil(
                height / 4
            );


        const required =
            blocksX *
            blocksY *
            16;


        if (
            data.length <
            required
        ) {

            throw new Error(
                "BC3 data is truncated."
            );
        }


        const out =
            new Uint8Array(
                width *
                height *
                4
            );


        let offset =
            0;


        for (
            let by = 0;
            by < height;
            by += 4
        ) {

            for (
                let bx = 0;
                bx < width;
                bx += 4
            ) {

                const a0 =
                    data[offset];

                const a1 =
                    data[offset + 1];


                const palette =
                    alphaPalette(
                        a0,
                        a1
                    );


                const color =
                    BC1.decode(

                        data.slice(
                            offset + 8,
                            offset + 16
                        ),

                        4,
                        4

                    );


                for (
                    let py = 0;
                    py < 4;
                    py++
                ) {

                    for (
                        let px = 0;
                        px < 4;
                        px++
                    ) {

                        const x =
                            bx + px;

                        const y =
                            by + py;


                        if (
                            x >= width ||
                            y >= height
                        )
                            continue;


                        const ai =
                            readAlphaIndex(
                                data,
                                offset + 2,
                                py * 4 + px
                            );


                        const sp =
                            (
                                py * 4 +
                                px
                            ) * 4;


                        const dp =
                            (
                                y *
                                width +
                                x
                            ) * 4;


                        out[dp] =
                            color.data[sp];

                        out[dp + 1] =
                            color.data[sp + 1];

                        out[dp + 2] =
                            color.data[sp + 2];

                        out[dp + 3] =
                            palette[ai];
                    }
                }


                offset += 16;
            }
        }


        return new Texture(
            width,
            height,
            out,
            "RGBA8"
        );
    };


    BC3.encode =
        function (texture) {

        const width =
            texture.width;

        const height =
            texture.height;


        const blocksX =
            Math.ceil(
                width / 4
            );

        const blocksY =
            Math.ceil(
                height / 4
            );


        const out =
            new Uint8Array(

                blocksX *
                blocksY *
                16

            );


        let offset =
            0;


        for (
            let by = 0;
            by < height;
            by += 4
        ) {

            for (
                let bx = 0;
                bx < width;
                bx += 4
            ) {

                const pixels =
                    new Uint8Array(64);


                let pp =
                    0;


                let minA =
                    255;

                let maxA =
                    0;


                for (
                    let py = 0;
                    py < 4;
                    py++
                ) {

                    for (
                        let px = 0;
                        px < 4;
                        px++
                    ) {

                        const x =
                            Math.min(
                                width - 1,
                                bx + px
                            );

                        const y =
                            Math.min(
                                height - 1,
                                by + py
                            );


                        const p =
                            (
                                y *
                                width +
                                x
                            ) * 4;


                        pixels[pp++] =
                            texture.data[p];

                        pixels[pp++] =
                            texture.data[p + 1];

                        pixels[pp++] =
                            texture.data[p + 2];

                        pixels[pp++] =
                            texture.data[p + 3];


                        minA =
                            Math.min(
                                minA,
                                texture.data[
                                    p + 3
                                ]
                            );

                        maxA =
                            Math.max(
                                maxA,
                                texture.data[
                                    p + 3
                                ]
                            );
                    }
                }


                let a0 =
                    maxA;

                let a1 =
                    minA;


                if (
                    a0 === a1
                ) {

                    if (a0 === 0) {

                        a0 = 0;
                        a1 = 0;

                    } else if (
                        a0 === 255
                    ) {

                        a0 = 255;
                        a1 = 254;

                    } else {

                        a1 =
                            Math.max(
                                0,
                                a0 - 1
                            );
                    }
                }


                out[offset] =
                    a0;

                out[offset + 1] =
                    a1;


                const ap =
                    alphaPalette(
                        a0,
                        a1
                    );


                let alphaBitsLow =
                    0;

                let alphaBitsHigh =
                    0;


                for (
                    let i = 0;
                    i < 16;
                    i++
                ) {

                    const alpha =
                        pixels[
                            i * 4 + 3
                        ];


                    let best =
                        0;

                    let bestDistance =
                        Infinity;


                    for (
                        let j = 0;
                        j < 8;
                        j++
                    ) {

                        const d =
                            Math.abs(
                                alpha -
                                ap[j]
                            );


                        if (
                            d <
                            bestDistance
                        ) {

                            bestDistance =
                                d;

                            best =
                                j;
                        }
                    }


                    const shift =
                        i * 3;


                    if (
                        shift < 32
                    ) {

                        alphaBitsLow |=
                            (
                                best <<
                                shift
                            ) >>> 0;

                    } else {

                        alphaBitsHigh |=
                            (
                                best <<
                                (
                                    shift - 32
                                )
                            ) >>> 0;
                    }
                }


                writeU32(
                    out,
                    offset + 2,
                    alphaBitsLow
                );


                /*
                 * The last four bits of the
                 * 48-bit alpha index block.
                 */
                out[offset + 6] |=
                    alphaBitsHigh & 255;

                out[offset + 7] |=
                    (
                        alphaBitsHigh >>>
                        8
                    ) & 255;


                /*
                 * Safer direct 48-bit writer.
                 */
                const alphaBytes =
                    new Uint8Array(6);


                let alphaValue =
                    0n;


                for (
                    let i = 0;
                    i < 16;
                    i++
                ) {

                    const alpha =
                        pixels[
                            i * 4 + 3
                        ];


                    let best =
                        0;

                    let bestDistance =
                        Infinity;


                    for (
                        let j = 0;
                        j < 8;
                        j++
                    ) {

                        const d =
                            Math.abs(
                                alpha -
                                ap[j]
                            );


                        if (
                            d <
                            bestDistance
                        ) {

                            bestDistance =
                                d;

                            best =
                                j;
                        }
                    }


                    alphaValue |=
                        BigInt(best) <<
                        BigInt(i * 3);
                }


                for (
                    let i = 0;
                    i < 6;
                    i++
                ) {

                    alphaBytes[i] =
                        Number(
                            (
                                alphaValue >>
                                BigInt(i * 8)
                            ) & 255n
                        );
                }


                out.set(
                    alphaBytes,
                    offset + 2
                );


                out.set(

                    BC1.encodeBlock(
                        pixels
                    ),

                    offset + 8

                );


                offset += 16;
            }
        }


        return out;
    };


    /*
     * ============================================================
     * BC4
     * ============================================================
     */

    const BC4 = {};


    BC4.name =
        "BC4";

    BC4.blockSize =
        8;


    function encodeBC4Block(
        values
    ) {

        let min =
            255;

        let max =
            0;


        for (
            let i = 0;
            i < 16;
            i++
        ) {

            min =
                Math.min(
                    min,
                    values[i]
                );

            max =
                Math.max(
                    max,
                    values[i]
                );
        }


        let a0 =
            max;

        let a1 =
            min;


        if (
            a0 === a1
        ) {

            if (a0 === 255)
                a1 = 254;

            else
                a1 = Math.max(
                    0,
                    a0 - 1
                );
        }


        const palette =
            alphaPalette(
                a0,
                a1
            );


        let bits =
            0n;


        for (
            let i = 0;
            i < 16;
            i++
        ) {

            let best =
                0;

            let distance =
                Infinity;


            for (
                let j = 0;
                j < 8;
                j++
            ) {

                const d =
                    Math.abs(
                        values[i] -
                        palette[j]
                    );


                if (
                    d <
                    distance
                ) {

                    distance =
                        d;

                    best =
                        j;
                }
            }


            bits |=
                BigInt(best) <<
                BigInt(i * 3);
        }


        const out =
            new Uint8Array(8);


        out[0] =
            a0;

        out[1] =
            a1;


        for (
            let i = 0;
            i < 6;
            i++
        ) {

            out[2 + i] =
                Number(
                    (
                        bits >>
                        BigInt(i * 8)
                    ) & 255n
                );
        }


        return out;
    }


    function decodeBC4Block(
        data,
        offset
    ) {

        const a0 =
            data[offset];

        const a1 =
            data[offset + 1];


        const palette =
            alphaPalette(
                a0,
                a1
            );


        let bits =
            0n;


        for (
            let i = 0;
            i < 6;
            i++
        ) {

            bits |=
                BigInt(
                    data[offset + 2 + i]
                ) <<
                BigInt(i * 8);
        }


        const values =
            new Uint8Array(16);


        for (
            let i = 0;
            i < 16;
            i++
        ) {

            const index =
                Number(
                    (
                        bits >>
                        BigInt(i * 3)
                    ) & 7n
                );


            values[i] =
                palette[index];
        }


        return values;
    }


    BC4.encode =
        function (texture) {

        const width =
            texture.width;

        const height =
            texture.height;


        const blocksX =
            Math.ceil(
                width / 4
            );

        const blocksY =
            Math.ceil(
                height / 4
            );


        const out =
            new Uint8Array(

                blocksX *
                blocksY *
                8

            );


        let offset =
            0;


        for (
            let by = 0;
            by < height;
            by += 4
        ) {

            for (
                let bx = 0;
                bx < width;
                bx += 4
            ) {

                const values =
                    new Uint8Array(16);


                let i =
                    0;


                for (
                    let py = 0;
                    py < 4;
                    py++
                ) {

                    for (
                        let px = 0;
                        px < 4;
                        px++
                    ) {

                        const x =
                            Math.min(
                                width - 1,
                                bx + px
                            );

                        const y =
                            Math.min(
                                height - 1,
                                by + py
                            );


                        const p =
                            (
                                y *
                                width +
                                x
                            ) * 4;


                        /*
                         * BC4 represents the
                         * red channel.
                         */
                        values[i++] =
                            texture.data[p];
                    }
                }


                out.set(

                    encodeBC4Block(
                        values
                    ),

                    offset

                );


                offset += 8;
            }
        }


        return out;
    };


    BC4.decode =
        function (
            data,
            width,
            height
        ) {

        data =
            toUint8Array(data);


        const blocksX =
            Math.ceil(
                width / 4
            );

        const blocksY =
            Math.ceil(
                height / 4
            );


        const required =
            blocksX *
            blocksY *
            8;


        if (
            data.length <
            required
        ) {

            throw new Error(
                "BC4 data is truncated."
            );
        }


        const out =
            new Uint8Array(
                width *
                height *
                4
            );


        let offset =
            0;


        for (
            let by = 0;
            by < height;
            by += 4
        ) {

            for (
                let bx = 0;
                bx < width;
                bx += 4
            ) {

                const values =
                    decodeBC4Block(
                        data,
                        offset
                    );


                for (
                    let py = 0;
                    py < 4;
                    py++
                ) {

                    for (
                        let px = 0;
                        px < 4;
                        px++
                    ) {

                        const x =
                            bx + px;

                        const y =
                            by + py;


                        if (
                            x >= width ||
                            y >= height
                        )
                            continue;


                        const value =
                            values[
                                py * 4 + px
                            ];


                        const p =
                            (
                                y *
                                width +
                                x
                            ) * 4;


                        out[p] =
                            value;

                        out[p + 1] =
                            value;

                        out[p + 2] =
                            value;

                        out[p + 3] =
                            255;
                    }
                }


                offset += 8;
            }
        }


        return new Texture(
            width,
            height,
            out,
            "RGBA8"
        );
    };


    /*
     * ============================================================
     * BC5
     * ============================================================
     */

    const BC5 = {};


    BC5.name =
        "BC5";

    BC5.blockSize =
        16;


    BC5.encode =
        function (texture) {

        const width =
            texture.width;

        const height =
            texture.height;


        const blocksX =
            Math.ceil(
                width / 4
            );

        const blocksY =
            Math.ceil(
                height / 4
            );


        const out =
            new Uint8Array(

                blocksX *
                blocksY *
                16

            );


        let offset =
            0;


        for (
            let by = 0;
            by < height;
            by += 4
        ) {

            for (
                let bx = 0;
                bx < width;
                bx += 4
            ) {

                const red =
                    new Uint8Array(16);

                const green =
                    new Uint8Array(16);


                let i =
                    0;


                for (
                    let py = 0;
                    py < 4;
                    py++
                ) {

                    for (
                        let px = 0;
                        px < 4;
                        px++
                    ) {

                        const x =
                            Math.min(
                                width - 1,
                                bx + px
                            );

                        const y =
                            Math.min(
                                height - 1,
                                by + py
                            );


                        const p =
                            (
                                y *
                                width +
                                x
                            ) * 4;


                        red[i] =
                            texture.data[p];

                        green[i] =
                            texture.data[
                                p + 1
                            ];


                        i++;
                    }
                }


                out.set(

                    encodeBC4Block(
                        red
                    ),

                    offset

                );


                out.set(

                    encodeBC4Block(
                        green
                    ),

                    offset + 8

                );


                offset += 16;
            }
        }


        return out;
    };


    BC5.decode =
        function (
            data,
            width,
            height
        ) {

        data =
            toUint8Array(data);


        const blocksX =
            Math.ceil(
                width / 4
            );

        const blocksY =
            Math.ceil(
                height / 4
            );


        const required =
            blocksX *
            blocksY *
            16;


        if (
            data.length <
            required
        ) {

            throw new Error(
                "BC5 data is truncated."
            );
        }


        const out =
            new Uint8Array(
                width *
                height *
                4
            );


        let offset =
            0;


        for (
            let by = 0;
            by < height;
            by += 4
        ) {

            for (
                let bx = 0;
                bx < width;
                bx += 4
            ) {

                const red =
                    decodeBC4Block(
                        data,
                        offset
                    );

                const green =
                    decodeBC4Block(
                        data,
                        offset + 8
                    );


                for (
                    let py = 0;
                    py < 4;
                    py++
                ) {

                    for (
                        let px = 0;
                        px < 4;
                        px++
                    ) {

                        const x =
                            bx + px;

                        const y =
                            by + py;


                        if (
                            x >= width ||
                            y >= height
                        )
                            continue;


                        const i =
                            py * 4 + px;


                        const p =
                            (
                                y *
                                width +
                                x
                            ) * 4;


                        out[p] =
                            red[i];

                        out[p + 1] =
                            green[i];

                        out[p + 2] =
                            0;

                        out[p + 3] =
                            255;
                    }
                }


                offset += 16;
            }
        }


        return new Texture(
            width,
            height,
            out,
            "RGBA8"
        );
    };


    /*
     * ============================================================
     * CODEC REGISTRY
     * ============================================================
     */

    codecs.set(
        "BC1",
        BC1
    );

    codecs.set(
        "DXT1",
        BC1
    );

    codecs.set(
        "BC2",
        BC2
    );

    codecs.set(
        "DXT3",
        BC2
    );

    codecs.set(
        "BC3",
        BC3
    );

    codecs.set(
        "DXT5",
        BC3
    );

    codecs.set(
        "BC4",
        BC4
    );

    codecs.set(
        "BC5",
        BC5
    );


    /*
     * ============================================================
     * MIPMAP
     * ============================================================
     */

    function generateMipmaps(
        texture,
        options
    ) {

        options =
            options || {};


        const levels =
            [];


        let current =
            texture.clone();


        /*
         * Do not recursively copy
         * old mipmaps.
         */
        current.mipmaps =
            [];


        levels.push(
            current
        );


        while (
            current.width > 1 ||
            current.height > 1
        ) {

            const width =
                Math.max(
                    1,
                    current.width >> 1
                );

            const height =
                Math.max(
                    1,
                    current.height >> 1
                );


            const out =
                new Uint8Array(

                    width *
                    height *
                    4

                );


            for (
                let y = 0;
                y < height;
                y++
            ) {

                for (
                    let x = 0;
                    x < width;
                    x++
                ) {

                    let r = 0;
                    let g = 0;
                    let b = 0;
                    let a = 0;

                    let count = 0;


                    for (
                        let oy = 0;
                        oy < 2;
                        oy++
                    ) {

                        for (
                            let ox = 0;
                            ox < 2;
                            ox++
                        ) {

                            const sx =
                                Math.min(
                                    current.width - 1,
                                    x * 2 + ox
                                );

                            const sy =
                                Math.min(
                                    current.height - 1,
                                    y * 2 + oy
                                );


                            const p =
                                (
                                    sy *
                                    current.width +
                                    sx
                                ) * 4;


                            r +=
                                current.data[p];

                            g +=
                                current.data[p + 1];

                            b +=
                                current.data[p + 2];

                            a +=
                                current.data[p + 3];


                            count++;
                        }
                    }


                    const p =
                        (
                            y *
                            width +
                            x
                        ) * 4;


                    out[p] =
                        clamp8(
                            r / count
                        );

                    out[p + 1] =
                        clamp8(
                            g / count
                        );

                    out[p + 2] =
                        clamp8(
                            b / count
                        );

                    out[p + 3] =
                        clamp8(
                            a / count
                        );
                }
            }


            current =
                new Texture(
                    width,
                    height,
                    out,
                    "RGBA8"
                );


            levels.push(
                current
            );
        }


        /*
         * Store generated mipmaps
         * on the original texture.
         */
        texture.mipmaps =
            levels.slice(1);


        texture.metadata.mipCount =
            levels.length;


        return levels;
    }


    /*
     * ============================================================
     * RESIZE
     * ============================================================
     */

    function resize(
        texture,
        newWidth,
        newHeight,
        filter
    ) {

        newWidth =
            Math.max(
                1,
                newWidth | 0
            );

        newHeight =
            Math.max(
                1,
                newHeight | 0
            );


        const out =
            new Uint8Array(

                newWidth *
                newHeight *
                4

            );


        filter =
            (
                filter ||
                "bilinear"
            ).toLowerCase();


        for (
            let y = 0;
            y < newHeight;
            y++
        ) {

            const sy =
                (
                    y + 0.5
                ) *
                texture.height /
                newHeight -
                0.5;


            for (
                let x = 0;
                x < newWidth;
                x++
            ) {

                const sx =
                    (
                        x + 0.5
                    ) *
                    texture.width /
                    newWidth -
                    0.5;


                let color;


                if (
                    filter === "nearest"
                ) {

                    color =
                        texture.pixel(
                            Math.round(sx),
                            Math.round(sy)
                        );

                } else {

                    color =
                        bilinearSample(
                            texture,
                            sx,
                            sy
                        );
                }


                const p =
                    (
                        y *
                        newWidth +
                        x
                    ) * 4;


                out[p] =
                    clamp8(color[0]);

                out[p + 1] =
                    clamp8(color[1]);

                out[p + 2] =
                    clamp8(color[2]);

                out[p + 3] =
                    clamp8(color[3]);
            }
        }


        return new Texture(
            newWidth,
            newHeight,
            out,
            "RGBA8"
        );
    }


    function bilinearSample(
        texture,
        x,
        y
    ) {

        const x0 =
            Math.floor(x);

        const y0 =
            Math.floor(y);

        const x1 =
            x0 + 1;

        const y1 =
            y0 + 1;


        const fx =
            x - x0;

        const fy =
            y - y0;


        const a =
            texture.pixel(
                x0,
                y0
            );

        const b =
            texture.pixel(
                x1,
                y0
            );

        const c =
            texture.pixel(
                x0,
                y1
            );

        const d =
            texture.pixel(
                x1,
                y1
            );


        const result =
            [];


        for (
            let i = 0;
            i < 4;
            i++
        ) {

            const top =
                a[i] +
                (
                    b[i] -
                    a[i]
                ) * fx;


            const bottom =
                c[i] +
                (
                    d[i] -
                    c[i]
                ) * fx;


            result[i] =
                top +
                (
                    bottom -
                    top
                ) * fy;
        }


        return result;
    }


    /*
     * ============================================================
     * CROP
     * ============================================================
     */

    function crop(
        texture,
        x,
        y,
        width,
        height
    ) {

        x |= 0;
        y |= 0;
        width |= 0;
        height |= 0;


        width =
            Math.max(
                1,
                width
            );

        height =
            Math.max(
                1,
                height
            );


        const out =
            new Uint8Array(

                width *
                height *
                4

            );


        for (
            let yy = 0;
            yy < height;
            yy++
        ) {

            for (
                let xx = 0;
                xx < width;
                xx++
            ) {

                const sx =
                    clamp(
                        x + xx,
                        0,
                        texture.width - 1
                    );

                const sy =
                    clamp(
                        y + yy,
                        0,
                        texture.height - 1
                    );


                const sp =
                    (
                        sy *
                        texture.width +
                        sx
                    ) * 4;


                const dp =
                    (
                        yy *
                        width +
                        xx
                    ) * 4;


                out[dp] =
                    texture.data[sp];

                out[dp + 1] =
                    texture.data[sp + 1];

                out[dp + 2] =
                    texture.data[sp + 2];

                out[dp + 3] =
                    texture.data[sp + 3];
            }
        }


        return new Texture(
            width,
            height,
            out,
            "RGBA8"
        );
    }


    /*
     * ============================================================
     * FLIP
     * ============================================================
     */

    function flipX(texture) {

        const out =
            new Uint8Array(
                texture.data.length
            );


        for (
            let y = 0;
            y < texture.height;
            y++
        ) {

            for (
                let x = 0;
                x < texture.width;
                x++
            ) {

                const sx =
                    texture.width -
                    1 -
                    x;


                const sp =
                    (
                        y *
                        texture.width +
                        sx
                    ) * 4;


                const dp =
                    (
                        y *
                        texture.width +
                        x
                    ) * 4;


                out[dp] =
                    texture.data[sp];

                out[dp + 1] =
                    texture.data[sp + 1];

                out[dp + 2] =
                    texture.data[sp + 2];

                out[dp + 3] =
                    texture.data[sp + 3];
            }
        }


        return new Texture(
            texture.width,
            texture.height,
            out,
            "RGBA8"
        );
    }


    function flipY(texture) {

        const out =
            new Uint8Array(
                texture.data.length
            );


        for (
            let y = 0;
            y < texture.height;
            y++
        ) {

            const sy =
                texture.height -
                1 -
                y;


            for (
                let x = 0;
                x < texture.width;
                x++
            ) {

                const sp =
                    (
                        sy *
                        texture.width +
                        x
                    ) * 4;


                const dp =
                    (
                        y *
                        texture.width +
                        x
                    ) * 4;


                out[dp] =
                    texture.data[sp];

                out[dp + 1] =
                    texture.data[sp + 1];

                out[dp + 2] =
                    texture.data[sp + 2];

                out[dp + 3] =
                    texture.data[sp + 3];
            }
        }


        return new Texture(
            texture.width,
            texture.height,
            out,
            "RGBA8"
        );
    }


    /*
     * ============================================================
     * ROTATE
     * ============================================================
     */

    function rotate(
        texture,
        angle
    ) {

        angle =
            (
                (angle % 360) +
                360
            ) % 360;


        if (
            angle === 0
        ) {

            return texture.clone();
        }


        if (
            angle !== 90 &&
            angle !== 180 &&
            angle !== 270
        ) {

            throw new Error(
                "Only 90, 180 and 270 degrees are supported."
            );
        }


        const newWidth =
            angle === 180
                ? texture.width
                : texture.height;


        const newHeight =
            angle === 180
                ? texture.height
                : texture.width;


        const out =
            new Uint8Array(

                newWidth *
                newHeight *
                4

            );


        for (
            let y = 0;
            y < texture.height;
            y++
        ) {

            for (
                let x = 0;
                x < texture.width;
                x++
            ) {

                let nx;
                let ny;


                if (
                    angle === 90
                ) {

                    nx =
                        texture.height -
                        1 -
                        y;

                    ny =
                        x;

                } else if (
                    angle === 180
                ) {

                    nx =
                        texture.width -
                        1 -
                        x;

                    ny =
                        texture.height -
                        1 -
                        y;

                } else {

                    nx =
                        y;

                    ny =
                        texture.width -
                        1 -
                        x;
                }


                const sp =
                    (
                        y *
                        texture.width +
                        x
                    ) * 4;


                const dp =
                    (
                        ny *
                        newWidth +
                        nx
                    ) * 4;


                out[dp] =
                    texture.data[sp];

                out[dp + 1] =
                    texture.data[sp + 1];

                out[dp + 2] =
                    texture.data[sp + 2];

                out[dp + 3] =
                    texture.data[sp + 3];
            }
        }


        return new Texture(
            newWidth,
            newHeight,
            out,
            "RGBA8"
        );
    }


    /*
     * ============================================================
     * COLOR
     * ============================================================
     */

    function grayscale(texture) {

        const out =
            texture.clone();


        for (
            let i = 0;
            i < out.data.length;
            i += 4
        ) {

            const gray =
                (
                    out.data[i] *
                    0.299 +

                    out.data[i + 1] *
                    0.587 +

                    out.data[i + 2] *
                    0.114
                );


            out.data[i] =
                clamp8(gray);

            out.data[i + 1] =
                clamp8(gray);

            out.data[i + 2] =
                clamp8(gray);
        }


        return out;
    }


    function invert(texture) {

        const out =
            texture.clone();


        for (
            let i = 0;
            i < out.data.length;
            i += 4
        ) {

            out.data[i] =
                255 -
                out.data[i];

            out.data[i + 1] =
                255 -
                out.data[i + 1];

            out.data[i + 2] =
                255 -
                out.data[i + 2];
        }


        return out;
    }


    function brightness(
        texture,
        amount
    ) {

        const out =
            texture.clone();


        for (
            let i = 0;
            i < out.data.length;
            i += 4
        ) {

            out.data[i] =
                clamp8(
                    out.data[i] +
                    amount
                );

            out.data[i + 1] =
                clamp8(
                    out.data[i + 1] +
                    amount
                );

            out.data[i + 2] =
                clamp8(
                    out.data[i + 2] +
                    amount
                );
        }


        return out;
    }


    function contrast(
        texture,
        amount
    ) {

        const out =
            texture.clone();


        for (
            let i = 0;
            i < out.data.length;
            i += 4
        ) {

            out.data[i] =
                clamp8(
                    (
                        out.data[i] -
                        128
                    ) *
                    amount +
                    128
                );


            out.data[i + 1] =
                clamp8(
                    (
                        out.data[i + 1] -
                        128
                    ) *
                    amount +
                    128
                );


            out.data[i + 2] =
                clamp8(
                    (
                        out.data[i + 2] -
                        128
                    ) *
                    amount +
                    128
                );
        }


        return out;
    }


    /*
     * ============================================================
     * ALPHA
     * ============================================================
     */

    function setAlpha(
        texture,
        value
    ) {

        const out =
            texture.clone();


        value =
            clamp8(value);


        for (
            let i = 3;
            i < out.data.length;
            i += 4
        ) {

            out.data[i] =
                value;
        }


        return out;
    }


    function premultiplyAlpha(
        texture
    ) {

        const out =
            texture.clone();


        for (
            let i = 0;
            i < out.data.length;
            i += 4
        ) {

            const a =
                out.data[i + 3] /
                255;


            out.data[i] =
                clamp8(
                    out.data[i] *
                    a
                );

            out.data[i + 1] =
                clamp8(
                    out.data[i + 1] *
                    a
                );

            out.data[i + 2] =
                clamp8(
                    out.data[i + 2] *
                    a
                );
        }


        return out;
    }


    function unpremultiplyAlpha(
        texture
    ) {

        const out =
            texture.clone();


        for (
            let i = 0;
            i < out.data.length;
            i += 4
        ) {

            const a =
                out.data[i + 3];


            if (
                a === 0
            )
                continue;


            const factor =
                255 / a;


            out.data[i] =
                clamp8(
                    out.data[i] *
                    factor
                );

            out.data[i + 1] =
                clamp8(
                    out.data[i + 1] *
                    factor
                );

            out.data[i + 2] =
                clamp8(
                    out.data[i + 2] *
                    factor
                );
        }


        return out;
    }


    /*
     * ============================================================
     * HISTOGRAM
     * ============================================================
     */

    function histogram(texture) {

        const result = {

            red:
                new Uint32Array(256),

            green:
                new Uint32Array(256),

            blue:
                new Uint32Array(256),

            alpha:
                new Uint32Array(256)

        };


        for (
            let i = 0;
            i < texture.data.length;
            i += 4
        ) {

            result.red[
                texture.data[i]
            ]++;

            result.green[
                texture.data[i + 1]
            ]++;

            result.blue[
                texture.data[i + 2]
            ]++;

            result.alpha[
                texture.data[i + 3]
            ]++;
        }


        return result;
    }


    /*
     * ============================================================
     * ENTROPY
     * ============================================================
     */

    function channelEntropy(
        histogramData,
        total
    ) {

        let entropy =
            0;


        for (
            let i = 0;
            i < 256;
            i++
        ) {

            const count =
                histogramData[i];


            if (
                count === 0
            )
                continue;


            const p =
                count / total;


            entropy -=
                p *
                Math.log2(p);
        }


        return entropy;
    }


    function entropy(texture) {

        const h =
            histogram(texture);


        const total =
            texture.width *
            texture.height;


        return {

            red:
                channelEntropy(
                    h.red,
                    total
                ),

            green:
                channelEntropy(
                    h.green,
                    total
                ),

            blue:
                channelEntropy(
                    h.blue,
                    total
                ),

            alpha:
                channelEntropy(
                    h.alpha,
                    total
                )
        };
    }


    /*
     * ============================================================
     * DOMINANT COLOR
     * ============================================================
     */

    function dominantColor(
        texture,
        sampleSize
    ) {

        sampleSize =
            Math.max(
                1,
                sampleSize || 32
            );


        const map =
            new Map();


        const stepX =
            Math.max(
                1,
                Math.floor(
                    texture.width /
                    sampleSize
                )
            );

        const stepY =
            Math.max(
                1,
                Math.floor(
                    texture.height /
                    sampleSize
                )
            );


        for (
            let y = 0;
            y < texture.height;
            y += stepY
        ) {

            for (
                let x = 0;
                x < texture.width;
                x += stepX
            ) {

                const p =
                    (
                        y *
                        texture.width +
                        x
                    ) * 4;


                /*
                 * Quantize to reduce
                 * map size.
                 */
                const r =
                    texture.data[p] >> 4;

                const g =
                    texture.data[p + 1] >> 4;

                const b =
                    texture.data[p + 2] >> 4;


                const key =
                    (
                        r << 8
                    ) |
                    (
                        g << 4
                    ) |
                    b;


                map.set(
                    key,
                    (
                        map.get(key) ||
                        0
                    ) + 1
                );
            }
        }


        let bestKey =
            0;

        let bestCount =
            0;


        map.forEach(
            function (
                count,
                key
            ) {

                if (
                    count >
                    bestCount
                ) {

                    bestCount =
                        count;

                    bestKey =
                        key;
                }
            }
        );


        return {

            r:
                (
                    (bestKey >> 8) &
                    15
                ) * 17,

            g:
                (
                    (bestKey >> 4) &
                    15
                ) * 17,

            b:
                (
                    bestKey &
                    15
                ) * 17,

            a:
                255,

            count:
                bestCount
        };
    }


    /*
     * ============================================================
     * ANALYSIS
     * ============================================================
     */

    function analyze(texture) {

        let hasAlpha =
            false;

        let transparent =
            0;

        let opaque =
            0;


        let minR =
            255;

        let minG =
            255;

        let minB =
            255;


        let maxR =
            0;

        let maxG =
            0;

        let maxB =
            0;


        let totalR =
            0;

        let totalG =
            0;

        let totalB =
            0;


        const pixelCount =
            texture.width *
            texture.height;


        for (
            let i = 0;
            i < texture.data.length;
            i += 4
        ) {

            const r =
                texture.data[i];

            const g =
                texture.data[i + 1];

            const b =
                texture.data[i + 2];

            const a =
                texture.data[i + 3];


            minR =
                Math.min(
                    minR,
                    r
                );

            minG =
                Math.min(
                    minG,
                    g
                );

            minB =
                Math.min(
                    minB,
                    b
                );


            maxR =
                Math.max(
                    maxR,
                    r
                );

            maxG =
                Math.max(
                    maxG,
                    g
                );

            maxB =
                Math.max(
                    maxB,
                    b
                );


            totalR +=
                r;

            totalG +=
                g;

            totalB +=
                b;


            if (
                a < 255
            )
                hasAlpha = true;


            if (
                a === 0
            )
                transparent++;


            if (
                a === 255
            )
                opaque++;
        }


        return {

            width:
                texture.width,

            height:
                texture.height,

            format:
                texture.format,

            pixels:
                pixelCount,

            channels:
                4,

            bytes:
                texture.data.length,

            memoryMB:
                texture.data.length /
                1024 /
                1024,

            hasAlpha,

            transparentPixels:
                transparent,

            opaquePixels:
                opaque,

            min: {

                r: minR,

                g: minG,

                b: minB

            },

            max: {

                r: maxR,

                g: maxG,

                b: maxB

            },

            average: {

                r:
                    totalR /
                    pixelCount,

                g:
                    totalG /
                    pixelCount,

                b:
                    totalB /
                    pixelCount

            },

            powerOfTwo:

                isPowerOfTwo(
                    texture.width
                ) &&

                isPowerOfTwo(
                    texture.height
                ),

            mipmaps:
                texture.mipmaps.length,

            entropy:
                entropy(texture),

            dominantColor:
                dominantColor(texture)

        };
    }


    /*
     * ============================================================
     * QUALITY
     * ============================================================
     */

    function compare(
        original,
        decoded
    ) {

        if (
            original.width !==
            decoded.width ||

            original.height !==
            decoded.height
        ) {

            throw new Error(
                "Texture dimensions do not match."
            );
        }


        let mse =
            0;

        let mae =
            0;

        let maxError =
            0;


        const length =
            original.data.length;


        for (
            let i = 0;
            i < length;
            i++
        ) {

            const difference =
                original.data[i] -
                decoded.data[i];


            const absolute =
                Math.abs(
                    difference
                );


            mse +=
                difference *
                difference;


            mae +=
                absolute;


            maxError =
                Math.max(
                    maxError,
                    absolute
                );
        }


        mse /=
            length;

        mae /=
            length;


        const rmse =
            Math.sqrt(mse);


        const psnr =
            mse === 0
                ? Infinity
                : 10 *
                  Math.log10(
                      (
                          255 * 255
                      ) / mse
                  );


        return {

            mse,

            rmse,

            mae,

            maxError,

            psnr

        };
    }


    /*
     * ============================================================
     * DIFFERENCE MAP
     * ============================================================
     */

    function differenceMap(
        original,
        decoded,
        amplify
    ) {

        if (
            original.width !==
            decoded.width ||

            original.height !==
            decoded.height
        ) {

            throw new Error(
                "Texture dimensions do not match."
            );
        }


        amplify =
            amplify === undefined
                ? 1
                : amplify;


        const out =
            new Uint8Array(
                original.data.length
            );


        for (
            let i = 0;
            i < out.length;
            i += 4
        ) {

            out[i] =
                clamp8(
                    Math.abs(
                        original.data[i] -
                        decoded.data[i]
                    ) * amplify
                );


            out[i + 1] =
                clamp8(
                    Math.abs(
                        original.data[i + 1] -
                        decoded.data[i + 1]
                    ) * amplify
                );


            out[i + 2] =
                clamp8(
                    Math.abs(
                        original.data[i + 2] -
                        decoded.data[i + 2]
                    ) * amplify
                );


            out[i + 3] =
                255;
        }


        return new Texture(

            original.width,

            original.height,

            out,

            "RGBA8"

        );
    }


    /*
     * ============================================================
     * COMPRESSION INFO
     * ============================================================
     */

    function compressedSize(
        width,
        height,
        format
    ) {

        format =
            format.toUpperCase();


        let blockSize;


        if (
            format === "BC1"
        ) {

            blockSize =
                8;

        } else if (
            format === "BC2" ||
            format === "BC3" ||
            format === "BC5"
        ) {

            blockSize =
                16;

        } else if (
            format === "BC4"
        ) {

            blockSize =
                8;

        } else {

            throw new Error(
                "Unsupported compression format: " +
                format
            );
        }


        return (

            Math.ceil(
                width / 4
            ) *

            Math.ceil(
                height / 4
            ) *

            blockSize

        );
    }


    function compressionInfo(
        texture,
        format
    ) {

        format =
            (
                format ||
                "BC1"
            ).toUpperCase();


        const original =
            texture.data.length;


        const compressed =
            compressedSize(
                texture.width,
                texture.height,
                format
            );


        return {

            format,

            originalBytes:
                original,

            compressedBytes:
                compressed,

            savedBytes:
                Math.max(
                    0,
                    original -
                    compressed
                ),

            compressionRatio:
                original /
                compressed,

            compressionPercent:
                (
                    1 -
                    compressed /
                    original
                ) * 100,

            originalMB:
                original /
                1024 /
                1024,

            compressedMB:
                compressed /
                1024 /
                1024
        };
    }


    /*
     * ============================================================
     * FORMAT DETECTION
     * ============================================================
     */

    function detect(data) {

        data =
            toUint8Array(data);


        if (
            data.length >= 4
        ) {

            const magic =
                String.fromCharCode(

                    data[0],

                    data[1],

                    data[2],

                    data[3]

                );


            if (
                magic === "DDS "
            ) {

                let format =
                    "DDS";


                if (
                    data.length >= 88
                ) {

                    const four =
                        fourCC(
                            data,
                            84
                        );


                    if (
                        four === "DXT1"
                    )
                        format =
                            "BC1";

                    else if (
                        four === "DXT3"
                    )
                        format =
                            "BC2";

                    else if (
                        four === "DXT5"
                    )
                        format =
                            "BC3";
                }


                return {

                    container:
                        "DDS",

                    format
                };
            }


            if (
                magic === "KTX "
            ) {

                return {

                    container:
                        "KTX",

                    format:
                        "KTX"
                };
            }
        }


        if (
            data.length >= 8 &&

            data[0] === 0x89 &&
            data[1] === 0x50 &&
            data[2] === 0x4E &&
            data[3] === 0x47 &&
            data[4] === 0x0D &&
            data[5] === 0x0A &&
            data[6] === 0x1A &&
            data[7] === 0x0A
        ) {

            return {

                container:
                    "PNG",

                format:
                    "PNG"
            };
        }


        if (
            data.length >= 2 &&

            data[0] === 0xFF &&
            data[1] === 0xD8
        ) {

            return {

                container:
                    "JPEG",

                format:
                    "JPEG"
            };
        }


        if (
            data.length >= 12 &&

            fourCC(
                data,
                0
            ) === "RIFF" &&

            fourCC(
                data,
                8
            ) === "WEBP"
        ) {

            return {

                container:
                    "WEBP",

                format:
                    "WEBP"
            };
        }


        return {

            container:
                "RAW",

            format:
                "UNKNOWN"
        };
    }


    /*
     * ============================================================
     * DDS HELPERS
     * ============================================================
     */

    function ddsLevelSize(
        width,
        height,
        format
    ) {

        return compressedSize(
            width,
            height,
            format
        );
    }


    function encodeLevel(
        texture,
        format
    ) {

        switch (
            format
        ) {

            case "BC1":
                return BC1.encode(
                    texture
                );

            case "BC2":
                return BC2.encode(
                    texture
                );

            case "BC3":
                return BC3.encode(
                    texture
                );

            case "BC4":
                return BC4.encode(
                    texture
                );

            case "BC5":
                return BC5.encode(
                    texture
                );

            default:
                throw new Error(
                    "Unsupported codec: " +
                    format
                );
        }
    }


    function decodeLevel(
        data,
        width,
        height,
        format
    ) {

        switch (
            format
        ) {

            case "BC1":
                return BC1.decode(
                    data,
                    width,
                    height
                );

            case "BC2":
                return BC2.decode(
                    data,
                    width,
                    height
                );

            case "BC3":
                return BC3.decode(
                    data,
                    width,
                    height
                );

            case "BC4":
                return BC4.decode(
                    data,
                    width,
                    height
                );

            case "BC5":
                return BC5.decode(
                    data,
                    width,
                    height
                );

            default:
                throw new Error(
                    "Unsupported codec: " +
                    format
                );
        }
    }


    function ddsFormatFromFourCC(
        four
    ) {

        switch (
            four
        ) {

            case "DXT1":
                return "BC1";

            case "DXT3":
                return "BC2";

            case "DXT5":
                return "BC3";

            case "ATI1":
            case "BC4U":
                return "BC4";

            case "ATI2":
            case "BC5U":
                return "BC5";

            default:
                return null;
        }
    }


    function ddsFourCC(
        format
    ) {

        switch (
            format
        ) {

            case "BC1":
                return "DXT1";

            case "BC2":
                return "DXT3";

            case "BC3":
                return "DXT5";

            case "BC4":
                return "ATI1";

            case "BC5":
                return "ATI2";

            default:
                return null;
        }
    }


    /*
     * ============================================================
     * DDS
     * ============================================================
     */

    const DDS = {};


    DDS.read =
        function (data) {

        data =
            toUint8Array(data);


        if (
            data.length < 128
        ) {

            throw new Error(
                "DDS file is too small."
            );
        }


        if (
            fourCC(
                data,
                0
            ) !== "DDS "
        ) {

            throw new Error(
                "Invalid DDS header."
            );
        }


        const height =
            readU32(
                data,
                12
            );


        const width =
            readU32(
                data,
                16
            );


        const mipCount =
            Math.max(

                1,

                readU32(
                    data,
                    28
                )

            );


        const four =
            fourCC(
                data,
                84
            );


        const format =
            ddsFormatFromFourCC(
                four
            );


        if (!format) {

            throw new Error(
                "Unsupported DDS format: " +
                four
            );
        }


        const levels =
            [];


        let offset =
            128;


        let levelWidth =
            width;

        let levelHeight =
            height;


        for (
            let level = 0;
            level < mipCount;
            level++
        ) {

            const size =
                ddsLevelSize(

                    levelWidth,

                    levelHeight,

                    format

                );


            if (
                offset + size >
                data.length
            ) {

                throw new Error(
                    "DDS mipmap data is truncated at level " +
                    level +
                    "."
                );
            }


            const compressed =
                data.slice(
                    offset,
                    offset + size
                );


            const texture =
                decodeLevel(

                    compressed,

                    levelWidth,

                    levelHeight,

                    format

                );


            texture.format =
                format;


            texture.metadata =
                {

                    container:
                        "DDS",

                    mipLevel:
                        level

                };


            levels.push(
                texture
            );


            offset +=
                size;


            levelWidth =
                Math.max(
                    1,
                    levelWidth >> 1
                );

            levelHeight =
                Math.max(
                    1,
                    levelHeight >> 1
                );
        }


        const texture =
            levels[0];


        texture.mipmaps =
            levels.slice(1);


        texture.metadata =
            {

                container:
                    "DDS",

                format,

                mipmaps:
                    levels.length,

                fourCC:
                    four

            };


        return texture;
    };


    DDS.write =
        function (
            texture,
            format,
            options
        ) {

        options =
            options || {};


        format =
            (
                format ||
                texture.format ||
                "BC1"
            ).toUpperCase();


        if (
            format === "DXT1"
        )
            format = "BC1";

        if (
            format === "DXT3"
        )
            format = "BC2";

        if (
            format === "DXT5"
        )
            format = "BC3";


        const four =
            ddsFourCC(
                format
            );


        if (!four) {

            throw new Error(
                "Unsupported DDS format: " +
                format
            );
        }


        let levels;


        if (
            options.mipmaps === false
        ) {

            levels = [
                texture
            ];

        } else if (
            texture.mipmaps &&
            texture.mipmaps.length > 0
        ) {

            levels = [
                texture
            ].concat(
                texture.mipmaps
            );

        } else {

            levels =
                generateMipmaps(
                    texture,
                    options
                );
        }


        /*
         * Optional max mip level.
         */
        if (
            options.maxMipmaps !==
            undefined
        ) {

            levels =
                levels.slice(
                    0,
                    Math.max(
                        1,
                        options.maxMipmaps | 0
                    )
                );
        }


        const encoded =
            [];


        let totalSize =
            0;


        for (
            let i = 0;
            i < levels.length;
            i++
        ) {

            const compressed =
                encodeLevel(

                    levels[i],

                    format

                );


            encoded.push(
                compressed
            );


            totalSize +=
                compressed.length;
        }


        const header =
            new Uint8Array(128);


        /*
         * Magic
         */

        header[0] =
            0x44;

        header[1] =
            0x44;

        header[2] =
            0x53;

        header[3] =
            0x20;


        /*
         * Header size
         */

        writeU32(
            header,
            4,
            124
        );


        /*
         * Flags
         *
         * CAPS
         * HEIGHT
         * WIDTH
         * PIXELFORMAT
         * MIPMAPCOUNT
         */
        writeU32(
            header,
            8,
            0xA1007
        );


        /*
         * Height
         */

        writeU32(
            header,
            12,
            texture.height
        );


        /*
         * Width
         */

        writeU32(
            header,
            16,
            texture.width
        );


        /*
         * Linear size
         */

        writeU32(
            header,
            20,
            encoded[0].length
        );


        /*
         * Mipmap count
         */

        writeU32(
            header,
            28,
            levels.length
        );


        /*
         * Pixel format size
         */

        writeU32(
            header,
            76,
            32
        );


        /*
         * Pixel format flags:
         * FOURCC
         */

        writeU32(
            header,
            80,
            4
        );


        header.set(
            makeFourCC(four),
            84
        );


        /*
         * Caps:
         * DDSCAPS_TEXTURE
         */

        let caps =
            0x1000;


        /*
         * DDSCAPS_COMPLEX +
         * DDSCAPS_MIPMAPCOUNT
         */

        if (
            levels.length > 1
        ) {

            caps |=
                0x8;

            caps |=
                0x400000;
        }


        writeU32(
            header,
            108,
            caps
        );


        const result =
            new Uint8Array(

                128 +
                totalSize

            );


        result.set(
            header,
            0
        );


        let offset =
            128;


        for (
            let i = 0;
            i < encoded.length;
            i++
        ) {

            result.set(
                encoded[i],
                offset
            );


            offset +=
                encoded[i].length;
        }


        return result;
    };


    /*
     * ============================================================
     * ATLAS
     * ============================================================
     */

    function createAtlas(
        textures,
        options
    ) {

        options =
            options || {};


        const padding =
            options.padding === undefined
                ? 0
                : Math.max(
                    0,
                    options.padding | 0
                );


        let width =
            0;

        let height =
            0;


        for (
            let i = 0;
            i < textures.length;
            i++
        ) {

            width =
                Math.max(
                    width,
                    textures[i].width
                );


            height +=
                textures[i].height +
                padding;
        }


        height =
            Math.max(
                1,
                height
            );


        width =
            Math.max(
                1,
                width
            );


        const atlas =
            new Texture(

                width,

                height,

                new Uint8Array(
                    width *
                    height *
                    4
                ),

                "RGBA8"

            );


        const regions =
            [];


        let y =
            0;


        for (
            let i = 0;
            i < textures.length;
            i++
        ) {

            const tex =
                textures[i];


            for (
                let yy = 0;
                yy < tex.height;
                yy++
            ) {

                for (
                    let xx = 0;
                    xx < tex.width;
                    xx++
                ) {

                    const sp =
                        (
                            yy *
                            tex.width +
                            xx
                        ) * 4;


                    const dp =
                        (
                            (
                                y + yy
                            ) *
                            width +
                            xx
                        ) * 4;


                    atlas.data[dp] =
                        tex.data[sp];

                    atlas.data[dp + 1] =
                        tex.data[sp + 1];

                    atlas.data[dp + 2] =
                        tex.data[sp + 2];

                    atlas.data[dp + 3] =
                        tex.data[sp + 3];
                }
            }


            regions.push({

                x:
                    0,

                y,

                width:
                    tex.width,

                height:
                    tex.height,

                u0:
                    0,

                v0:
                    y / height,

                u1:
                    tex.width /
                    width,

                v1:
                    (
                        y +
                        tex.height
                    ) / height

            });


            y +=
                tex.height +
                padding;
        }


        atlas.metadata.atlas =
            regions;


        return {

            texture:
                atlas,

            regions
        };
    }


    /*
     * ============================================================
     * VALIDATION
     * ============================================================
     */

    function validate(
        texture
    ) {

        const errors =
            [];


        if (
            !texture ||
            !(
                texture instanceof
                Texture
            )
        ) {

            errors.push(
                "Not a Texture object."
            );


            return {

                valid:
                    false,

                errors

            };
        }


        if (
            texture.width <= 0 ||
            texture.height <= 0
        ) {

            errors.push(
                "Invalid dimensions."
            );
        }


        if (
            texture.data.length !==
            texture.width *
            texture.height *
            4
        ) {

            errors.push(
                "Invalid data size."
            );
        }


        if (
            !Array.isArray(
                texture.mipmaps
            )
        ) {

            errors.push(
                "Invalid mipmap list."
            );
        }


        return {

            valid:
                errors.length === 0,

            errors

        };
    }


    /*
     * ============================================================
     * CODEC API
     * ============================================================
     */

    function registerCodec(
        name,
        codec
    ) {

        if (!name)
            throw new Error(
                "Codec name required."
            );


        if (!codec)
            throw new Error(
                "Codec object required."
            );


        codecs.set(

            name.toUpperCase(),

            codec

        );


        return AHETEX;
    }


    function getCodec(name) {

        return codecs.get(

            String(
                name
            ).toUpperCase()

        );
    }


    /*
     * ============================================================
     * MAIN API
     * ============================================================
     */

    const AHETEX = {

        VERSION,

        FORMATS,

        Texture,

        codecs,


        /*
         * Create
         */

        fromRGBA:
            function (
                width,
                height,
                data
            ) {

            return new Texture(

                width,

                height,

                data,

                "RGBA8"

            );
        },


        /*
         * Decode
         */

        decode:
            function (
                data,
                format,
                width,
                height
            ) {

            const codec =
                getCodec(
                    format
                );


            if (!codec)
                throw new Error(
                    "Codec not available: " +
                    format
                );


            if (!codec.decode)
                throw new Error(
                    "Decoder not implemented: " +
                    format
                );


            return codec.decode(

                data,

                width,

                height

            );
        },


        /*
         * Encode
         */

        encode:
            function (
                texture,
                format
            ) {

            const codec =
                getCodec(
                    format
                );


            if (!codec)
                throw new Error(
                    "Codec not available: " +
                    format
                );


            if (!codec.encode)
                throw new Error(
                    "Encoder not implemented: " +
                    format
                );


            return codec.encode(
                texture
            );
        },


        /*
         * BC1
         */

        encodeBC1:
            function (texture) {

            return BC1.encode(
                texture
            );
        },


        decodeBC1:
            function (
                data,
                width,
                height
            ) {

            return BC1.decode(
                data,
                width,
                height
            );
        },


        /*
         * BC2
         */

        encodeBC2:
            function (texture) {

            return BC2.encode(
                texture
            );
        },


        decodeBC2:
            function (
                data,
                width,
                height
            ) {

            return BC2.decode(
                data,
                width,
                height
            );
        },


        /*
         * BC3
         */

        encodeBC3:
            function (texture) {

            return BC3.encode(
                texture
            );
        },


        decodeBC3:
            function (
                data,
                width,
                height
            ) {

            return BC3.decode(
                data,
                width,
                height
            );
        },


        /*
         * BC4
         */

        encodeBC4:
            function (texture) {

            return BC4.encode(
                texture
            );
        },


        decodeBC4:
            function (
                data,
                width,
                height
            ) {

            return BC4.decode(
                data,
                width,
                height
            );
        },


        /*
         * BC5
         */

        encodeBC5:
            function (texture) {

            return BC5.encode(
                texture
            );
        },


        decodeBC5:
            function (
                data,
                width,
                height
            ) {

            return BC5.decode(
                data,
                width,
                height
            );
        },


        /*
         * DDS
         */

        readDDS:
            function (data) {

            return DDS.read(
                data
            );
        },


        writeDDS:
            function (
                texture,
                format,
                options
            ) {

            return DDS.write(

                texture,

                format,

                options

            );
        },


        /*
         * Mipmap
         */

        mipmap:
            function (
                texture,
                options
            ) {

            return generateMipmaps(

                texture,

                options

            );
        },


        generateMipmaps:
            function (
                texture,
                options
            ) {

            return generateMipmaps(

                texture,

                options

            );
        },


        /*
         * Image
         */

        resize,

        crop,

        flipX,

        flipY,

        rotate,


        /*
         * Color
         */

        grayscale,

        invert,

        brightness,

        contrast,


        /*
         * Alpha
         */

        setAlpha,

        premultiplyAlpha,

        unpremultiplyAlpha,


        /*
         * Analysis
         */

        histogram,

        analyze,

        entropy,

        dominantColor,

        compare,

        differenceMap,

        compressionInfo,


        /*
         * Atlas
         */

        createAtlas,


        /*
         * Format
         */

        detect,

        validate,


        /*
         * Compression
         */

        compressedSize,


        /*
         * Utility
         */

        isPowerOfTwo,

        nextPowerOfTwo,


        /*
         * Codec/plugin
         */

        registerCodec,

        getCodec,


        /*
         * Async API
         */

        decodeAsync:
            function () {

            const args =
                arguments;


            return new Promise(

                function (
                    resolve,
                    reject
                ) {

                    const run =
                        function () {

                        try {

                            resolve(

                                AHETEX.decode
                                    .apply(
                                        AHETEX,
                                        args
                                    )

                            );

                        } catch (e) {

                            reject(e);
                        }
                    };


                    if (
                        typeof setTimeout !==
                        "undefined"
                    ) {

                        setTimeout(
                            run,
                            0
                        );

                    } else {

                        run();
                    }
                }

            );
        },


        encodeAsync:
            function () {

            const args =
                arguments;


            return new Promise(

                function (
                    resolve,
                    reject
                ) {

                    const run =
                        function () {

                        try {

                            resolve(

                                AHETEX.encode
                                    .apply(
                                        AHETEX,
                                        args
                                    )

                            );

                        } catch (e) {

                            reject(e);
                        }
                    };


                    if (
                        typeof setTimeout !==
                        "undefined"
                    ) {

                        setTimeout(
                            run,
                            0
                        );

                    } else {

                        run();
                    }
                }

            );
        }
    };


    /*
     * ============================================================
     * NATIVE IMAGE LOADING - BROWSER
     * ============================================================
     */

    AHETEX.loadImage =
        function (source) {

        if (
            typeof document ===
            "undefined"
        ) {

            return Promise.reject(

                new Error(
                    "loadImage is available in browser environments."
                )

            );
        }


        return new Promise(

            function (
                resolve,
                reject
            ) {

                const img =
                    new Image();


                img.onload =
                    function () {

                    const canvas =
                        document.createElement(
                            "canvas"
                        );


                    canvas.width =
                        img.naturalWidth;

                    canvas.height =
                        img.naturalHeight;


                    const ctx =
                        canvas.getContext(
                            "2d",
                            {
                                willReadFrequently:
                                    true
                            }
                        );


                    ctx.drawImage(
                        img,
                        0,
                        0
                    );


                    const image =
                        ctx.getImageData(

                            0,
                            0,

                            canvas.width,
                            canvas.height

                        );


                    resolve(

                        new Texture(

                            canvas.width,

                            canvas.height,

                            new Uint8Array(
                                image.data
                            ),

                            "RGBA8"

                        )

                    );
                };


                img.onerror =
                    function () {

                    reject(

                        new Error(
                            "Image loading failed."
                        )

                    );
                };


                if (
                    typeof Blob !==
                    "undefined" &&

                    source instanceof Blob
                ) {

                    img.src =
                        URL.createObjectURL(
                            source
                        );

                } else {

                    img.src =
                        source;
                }
            }

        );
    };


    /*
     * ============================================================
     * EXPORT
     * ============================================================
     */

    return AHETEX;

});