
/**
 * Custom functions and blocks for interfacing with TFT display
 * and most code is from http://www.obliquely.org.uk/connecting-a-microbit-and-adafruit-1-44-display/
 *
 * For documentation on the AdaFruit 1.44" TFT display
 * see: https://learn.adafruit.com/adafruit-1-44-color-tft-with-micro-sd-socket
 *
 * The code to drive the display has been adapted from the code provided (in C++)
 * by AdaFruit.
 *
 * For syntax that makes functions and enums available in the blocks editor
 * see https://makecode.microbit.org/blocks/custom
 */

enum DISPLAY_CONTROLLER {

    ST7735 = 0,
    ILI9341 = 1
}

enum COLOR {
    //% block="Black"
    Black = 0x0000,
    //% block="Navy"
    Navy = 0x000F,
    //% block="DarkGreen"
    DarkGreen = 0x03E0,
    //% block="DarkCyan"
    DarkCyan = 0x03EF,
    //% block="Maroon"
    Maroon = 0x7800,
    //% block="Purple"
    Purple = 0x780F,
    //% block="Olive"
    Olive = 0x7BE0,
    //% block="LightGrey"
    LightGrey = 0xC618,
    //% block="DarkGrey"
    DarkGrey = 0x7BEF,
    //% block="Blue"
    Blue = 0x001F,
    //% block="Green"
    Green = 0x07E0,
    //% block="Cyan"
    Cyan = 0x07FF,
    //% block="Red"
    Red = 0xF800,
    //% block="Magenta"
    Magenta = 0xF81F,
    //% block="Yellow"
    Yellow = 0xFFE0,
    //% block="White"
    White = 0xFFFF,
    //% block="Orange"
    Orange = 0xFD20,
    //% block="GreenYellow"
    GreenYellow = 0xAFE5,
    //% block="Pink"
    Pink = 0xF81F
};

//% weight=20 color=#000fff icon="\uf10b" block="LCD"
namespace TFTDisplay {

    /**
     * TFT display commands
     * Only the commands actually used are included here. See the ST7735R
     * data sheet for the full set of commands.
     */
    enum TftCom {
        //        NOOP = 0x00,
        SWRESET = 0x01,
        SLPOUT = 0x11,
        //        NORON = 0x13,
        //        INVOFF = 0x20,
        GMCRV = 0x26,
        DISPON = 0x29,
        CASET = 0x2A,
        RASET = 0x2B,
        RAMWR = 0x2C,
        MADCTL = 0x36,
        COLMOD = 0x3A,
        FRMCTR1 = 0xB1,
        FRMCTR2 = 0xB2,
        FRMCTR3 = 0xB3,
        INVCTR = 0xB4,
        DFCTL = 0xB6,
        PWCTR1 = 0xC0,
        PWCTR2 = 0xC1,
        PWCTR3 = 0xC2,
        PWCTR4 = 0xC3,
        PWCTR5 = 0xC4,
        PWCTRA = 0xCB,
        PWCTRB = 0xCF,
        VMCTR1 = 0xC5,
        VMCTR2 = 0xC7,
        GMCTRP1 = 0xE0,
        GMCTRN1 = 0xE1,
        DTCTRA = 0xE8,
        DTCTRB = 0xEA,
        POSEQ = 0xED,
        GAMFUN = 0xF2,
        PMPRTO = 0xF7,
        DELAY = 0xFFFF
    }

    let screen_x = 128
    let screen_y = 160
    let model = DISPLAY_CONTROLLER.ST7735
    let DC = DigitalPin.P15
    let CS = DigitalPin.P10
    let RS = DigitalPin.P16

    function displayScale(): number {
        return 1
    }

    /**
     * The display width in ‘working coordinates’. These are pixel values * displayScale()
     */
    function displayWidth(): number {
        return screen_x * displayScale()
    }

    /**
     * The display height in ‘working coordinates’. These are pixel values * displayScale()
     */
    function displayHeight(): number {
        return screen_y * displayScale()
    }

    /**
     * Convert a working coordinate to an actual pixel coordinate.
     * Don’t expose this in final code. It should be internal.
     */
    function roundedPixel(value: number): number {
        let adjusted = value / displayScale();
        adjusted = adjusted + (value & (displayScale() - 1) ? 1 : 0)
        return adjusted;
    }

    function outOfBounds(v1: number, v2 = 0, v3 = 0, v4 = 0): boolean {
        if (v1 < 0 || v1 > screen_x - 1) {
            return true
        }
        if (v2 < 0 || v2 > screen_y - 1) {
            return true
        }
        if (v3 < 0 || v3 > screen_x - 1) {
            return true
        }
        if (v4 < 0 || v4 > screen_y - 1) {
            return true
        }
        return false
    }

    /**
     * Set the address window
     */
    function setAddrWindow(x0: number, y0: number, x1: number, y1: number): void {

        if (outOfBounds(x0, y0, x1, y1)) {
            return
        }
        // set the column
        //tftCom(TftCom.CASET, [0x00, x0 + 2, 0x00, x1 + 2]) // 2 is an adjust for thr AdaFruit 1.44 display
        tftCom(TftCom.CASET, [x0 >> 8, x0, x1 >> 8, x1])
        // set the row
        //tftCom(TftCom.RASET, [0x00, y0 + 3, 0x00, y1 + 3]) // 3 is an adjust for thr AdaFruit 1.44 display
        tftCom(TftCom.RASET, [y0 >> 8, y0, y1 >> 8, y1])
    }

    /**
     * Write a command to the TFT display
     */
    function tftCom(command: TftCom, params: Array<number>): void {

        // handle the pseudo ‘DELAY’ command - provides a delay in milliseconds
        if (command == TftCom.DELAY) {
            let waitTime: number = 500
            if (params.length == 1) {
                waitTime = params[0]
            }
            basic.pause(waitTime)
            return
        }

        // let the TFT know we’re sending a command (rather than data)
        pins.digitalWritePin(DC, 0) // command/data = command
        // select the TFT controller
        pins.digitalWritePin(CS, 0) // select the TFT as SPI target

        pins.spiWrite(command)

        // let the TFT know we’re sending data bytes (rather than a command)
        pins.digitalWritePin(DC, 1) // command/data = data

        for (let dataItem of params) {
            pins.spiWrite(dataItem)
        }

        // de-select the TFT controller
        pins.digitalWritePin(CS, 1) // de-elect the TFT as SPI target
    }

    /**
     * Do initial set up for display. (Required before any drawing begins.)
     */
    function tftSetup_ST7735(): void {

        // General Setup (for various display types)

        // 1. Software Reset
        tftCom(TftCom.SWRESET, [1])
        tftCom(TftCom.DELAY, [1])
        tftCom(TftCom.SWRESET, [0])
        tftCom(TftCom.DELAY, [1])
        tftCom(TftCom.SWRESET, [1])
        tftCom(TftCom.DELAY, [120]) // we need ot wait at least 120ms

        // 2. Exit Sleep Mode
        tftCom(TftCom.SLPOUT, [])
        tftCom(TftCom.DELAY, [120]) // we need to wait at least 120ms

        // 3. Frame rate ctrl - normal mode
        tftCom(TftCom.FRMCTR1, [0x01, 0x2C, 0x2D])

        // 4. Frame rate ctrl - idle mode
        tftCom(TftCom.FRMCTR2, [0x01, 0x2C, 0x2D])

        // 5. Frame rate ctrl - dot inversion mode
        tftCom(TftCom.FRMCTR3, [0x01, 0x2C, 0x2D, 0x01, 0x2C, 0x2D])

        // 6. Display inversion ctrl - no inversion
        tftCom(TftCom.INVCTR, [0x07])

        // 7. Power Control -4.6v, Auto Mode
        tftCom(TftCom.PWCTR1, [0xA2, 0x02, 0x84])

        // 8. Power control,VGH25 = 2.4C VGSEL = -10 VGH = 3 * AVDD
        tftCom(TftCom.PWCTR2, [0xC5])

        // 9: Power control, Opamp current small + Boost Frequency
        tftCom(TftCom.PWCTR3, [0x0A, 0x00])

        // 10: Power control, BCLK/2, Opamp current small & Medium low
        tftCom(TftCom.PWCTR4, [0x8A, 0x2A])

        // 11: Power control
        tftCom(TftCom.PWCTR5, [0x8A, 0xEE])

        // 12: Power control
        tftCom(TftCom.VMCTR1, [0x0E])

        // 13. Don’t invert display
        //tftCom(TftCom.INVOFF, [])

        // 14: Memory access control (directions)
        tftCom(TftCom.MADCTL, [0xC0])

        // Further General Setup (for various display types)

        //1: Gamma Correction
        tftCom(TftCom.GMCTRP1, [0x0F, 0x1A, 0x0F, 0x18, 0x2F, 0x28, 0x20, 0x22, 0x1F, 0x1B, 0x23, 0x37, 0x00, 0x07, 0x02, 0x10])

        //2: Gamma Correction
        tftCom(TftCom.GMCTRN1, [0x0F, 0x1B, 0x0F, 0x17, 0x33, 0x2C, 0x29, 0x2E, 0x30, 0x30, 0x39, 0x3F, 0x00, 0x07, 0x03, 0x10])

        // 3: set color mode, 16-bit colour
        tftCom(TftCom.COLMOD, [0x05])

        // 4: Main screen turn on
        tftCom(TftCom.DISPON, [])
    }


    /**
     * Do initial set up for display. (Required before any drawing begins.)
     */
    function tftSetup_ILI9341(): void {

        // General Setup (for various display types)
        tftCom(TftCom.SWRESET, [1])
        tftCom(TftCom.DELAY, [1])
        tftCom(TftCom.SWRESET, [0])
        tftCom(TftCom.DELAY, [1])
        tftCom(TftCom.SWRESET, [1])
        tftCom(TftCom.DELAY, [120]) // we need ot wait at least 120ms

        //power control A
        tftCom(TftCom.PWCTRA, [0x39, 0x2C, 0x00, 0x34, 0x02])

        //power control B
        tftCom(TftCom.PWCTRB, [0x00, 0xC1, 0x30])

        //driver timing control A
        tftCom(TftCom.DTCTRA, [0x85, 0x00, 0x78])

        //driver timing control B
        tftCom(TftCom.DTCTRB, [0x00, 0x00])

        //power on sequence control
        tftCom(TftCom.POSEQ, [0x64, 0x03, 0x12, 0x81])

        //pump ratio control
        tftCom(TftCom.PMPRTO, [0x20])

        //power control,VRH[5:0]
        tftCom(TftCom.PWCTR1, [0x23])

        //Power control,SAP[2:0];BT[3:0]
        tftCom(TftCom.PWCTR2, [0x10])

        //vcm control
        tftCom(TftCom.VMCTR1, [0x3E, 0x28])

        //vcm control 2
        tftCom(TftCom.VMCTR2, [0x86])

        //memory access control
        tftCom(TftCom.MADCTL, [0x48])

        //pixel format
        tftCom(TftCom.COLMOD, [0x55])

        //frameration control,normal mode full colours
        tftCom(TftCom.FRMCTR1, [0x00, 0x18])

        //display function control
        tftCom(TftCom.DFCTL, [0x08, 0x82, 0x27])

        //3gamma function disable
        tftCom(TftCom.GAMFUN, [0x00])

        //gamma curve selected
        tftCom(TftCom.GMCRV, [0x01])

        //1: Gamma Correction

        //2: Gamma Correction
        //set positive gamma correction
        tftCom(TftCom.GMCTRP1, [0x0F, 0x31, 0x2B, 0x0C, 0x0E, 0x08, 0x4E, 0xF1, 0x37, 0x07, 0x10, 0x03, 0x0E, 0x09, 0x00])

        //set negative gamma correction
        tftCom(TftCom.GMCTRN1, [0x00, 0x0E, 0x14, 0x03, 0x11, 0x07, 0x31, 0xC1, 0x48, 0x08, 0x0F, 0x0C, 0x31, 0x36, 0x0F])

        //exit sleep
        tftCom(TftCom.SLPOUT, [])
        tftCom(TftCom.DELAY, [120]) // we need ot wait at least 120ms

        //display on
        tftCom(TftCom.DISPON, [])
    }

    /**
     * Draw a line of a given colour
     */
    //% blockId="TFT_drawLine" block="drawLine on x0:%x0|y0:%y0|x1:%x1|y1:%y1|colour:%colour"
    //% weight=97
    export function drawLine(x0: number, y0: number, x1: number, y1: number, colour: number): void {
        let xDelta = x1 - x0
        let yDelta = y1 - y0

        if (Math.abs(yDelta) > Math.abs(xDelta)) {
            let ySteps = Math.abs(yDelta / displayScale())
            let xIncrement = xDelta == 0 ? 0 : xDelta / ySteps
            let yIncrement = yDelta > 0 ? displayScale() : -1 * displayScale()

            let x = x0
            let y = y0;
            for (let steps = 0; steps <= ySteps; steps++) {
                drawPixel(roundedPixel(x), roundedPixel(y), colour)
                x = x + xIncrement
                y = y + yIncrement
            }
            return
        }

        let xSteps = Math.abs(xDelta / displayScale())
        let yIncrement = yDelta == 0 ? 0 : yDelta / xSteps;
        let xIncrement = xDelta > 0 ? displayScale() : -1 * displayScale()

        let y = y0;
        let x = x0
        for (let steps = 0; steps <= xSteps; steps++) {
            drawPixel(roundedPixel(x), roundedPixel(y), colour)
            y = y + yIncrement
            x = x + xIncrement
        }
    }

    /**
     * Draw a single pixel of a given colour
     */
    //% blockId="TFT_drawPixel" block="drawPixel on x:%x|y:%y|colour:%colour"
    //% weight=98
    export function drawPixel(x: number, y: number, colour: number): void {
        if (outOfBounds(x, y)) {
            return
        }

        setAddrWindow(x, y, x + 1, y + 1);
        // send data (16 bits in two bytes)
        tftCom(TftCom.RAMWR, [colour >> 8, colour])
    }

    /**
     * Fill a rectangle with a given colour
     */
    //% blockId="TFT_fillRect" block="fillRect on x:%x|y:%y|width:%width|height:%height|colour:%colour"
    //% weight=96
    export function fillRect(x: number, y: number, width: number, height: number, colour: number): void {

        if (outOfBounds(x, y)) {
            return;
        }

        if ((x + width) > screen_x) {
            width = screen_x - x;
        }

        if ((y + height) > screen_y) {
            height = screen_y - y;
        }

        let hiColour = (colour >> 8) % 256;
        let loColour = colour % 256;

        setAddrWindow(x, y, x + width - 1, y + height - 1);

        // we are going to manually implement the RAMWR command here because
        // we have custom parameters. See comments in tftCom for details
        // of what’s going on here.
        pins.digitalWritePin(DC, 0); // command/data = command
        pins.digitalWritePin(CS, 0); // select the TFT as SPI target
        pins.spiWrite(TftCom.RAMWR);
        pins.digitalWritePin(DC, 1); // command/data = data

        for (let indexY = height; indexY > 0; indexY--) {
            for (let indexX = width; indexX > 0; indexX--) {
                pins.spiWrite(hiColour)
                pins.spiWrite(loColour)
            }
        }

        pins.digitalWritePin(CS, 1) // de-elect the TFT as SPI target
        pins.digitalWritePin(DC, 0) // command/data = command
    }

    /**
     * Fill a rectangle with a given colour
     */
    //% blockId="TFT_randomFillRect" block="fillRect on x:%x|y:%y|width:%width|height:%height| with random color"
    //% weight=96
    export function randomFillRect(x: number, y: number, width: number, height: number): void {

        if (outOfBounds(x, y)) {
            return;
        }

        if ((x + width) > screen_x) {
            width = screen_x - x;
        }

        if ((y + height) > screen_y) {
            height = screen_y - y;
        }

        setAddrWindow(x, y, x + width - 1, y + height - 1);

        // we are going to manually implement the RAMWR command here because
        // we have custom parameters. See comments in tftCom for details
        // of what’s going on here.
        pins.digitalWritePin(DC, 0); // command/data = command
        pins.digitalWritePin(CS, 0); // select the TFT as SPI target
        pins.spiWrite(TftCom.RAMWR);
        pins.digitalWritePin(DC, 1); // command/data = data

        for (let indexY = height; indexY > 0; indexY--) {
            for (let indexX = width; indexX > 0; indexX--) {
                pins.spiWrite(Math.randomRange(0, 255))
                pins.spiWrite(Math.randomRange(0, 255))
            }
        }

        pins.digitalWritePin(CS, 1) // de-elect the TFT as SPI target
        pins.digitalWritePin(DC, 0) // command/data = command
    }

    /**
     * Setup and clear screen ready for used
     */
    //% blockId="TFT_setupScreen" block="setupScreen width:%x height:%y model:%_model MOSI:%MOSI SCK:%SCK CS:%CS DC:%DC RS:%RESET"
    //% x.defl=128
    //% y.defl=160
    //% _model.defl=DISPLAY_CONTROLLER.ST7735
    //% MOSI.defl=DigitalPin.P14
    //% SCK.defl=DigitalPin.P13
    //% _CS.defl=DigitalPin.P10
    //% _DC.defl=DigitalPin.P15
    //% _RESET.defl=DigitalPin.P16
    //% weight=99
    export function setupScreen(x: number = 128, y: number = 160, _model: DISPLAY_CONTROLLER, MOSI: DigitalPin = DigitalPin.P14, SCK: DigitalPin = DigitalPin.P13, _CS: DigitalPin = DigitalPin.P10, _DC: DigitalPin = DigitalPin.P15, _RESET: DigitalPin = DigitalPin.P16): void {
        screen_x = x
        screen_y = y
        model = _model
        CS = _CS
        DC = _DC
        RS = _RESET

        pins.digitalWritePin(RS, 1)
        pins.spiPins(MOSI, DigitalPin.P8, SCK)
        pins.spiFrequency(4000000) // try a fast rate for serial bus

        if (model == DISPLAY_CONTROLLER.ILI9341)
            tftSetup_ILI9341()
        else if (model == DISPLAY_CONTROLLER.ST7735)
            tftSetup_ST7735()
    }

    /**
    * Clear screen
    */
    //% blockId="TFT_clearScreen" block="clearScreen"
    //% weight=95
    export function clearScreen(): void {
        fillRect(
            0,
            0,
            screen_x,
            screen_y,
            0
        )
    }

    /**
    * Get Color
    */
    //% blockId=Get_Color
    //% blockGap=8
    //% block="%color"
    //% weight=94
    export function Get_Color(color: COLOR): number {
        return color;
    }
}
