# ST7735 / ILI9341 extension for MakeCode Micro:Bit


froked from http://www.obliquely.org.uk/connecting-a-microbit-and-adafruit-1-44-display/


and http://www.obliquely.org.uk/bbc-microbit-lunar-lander-project-part-1/


and https://github.com/daniel-pers/pxt-microbit-LCD-TFT-SPI-ST7735


and https://www.displaytech-us.com/forum/ili9341-initialization-code

font from microbit SSD1306 library.


related parts :

https://www.aliexpress.com/item/Joystick-bit-Joystick-Module-Expansion-Board-Transparent-Acrylic-Case-for-BBC-Micro-bit-Microbit/32918186399.html?spm=2114.search0104.3.21.91d948d9ThWsGZ&ws_ab_test=searchweb0_0,searchweb201602_8_10065_10068_319_10059_10884_317_10887_10696_321_322_10084_453_10083_454_10103_10618_10307_10712_537_536_10713,searchweb201603_6,ppcSwitch_0&algo_expid=16689819-d750-4a5d-b6c2-b002f3935c44-3&algo_pvid=16689819-d750-4a5d-b6c2-b002f3935c44&transAbTest=ae803_3

Be cautious with pin order!!! blue PCB models have different pin order.

https://www.aliexpress.com/item/1-8-inch-TFT-LCD-Module-LCD-Screen-Module-ST7735-SPI-serial-51-drivers-4-IO/32964493983.html?spm=2114.search0104.3.140.745d7d9fOtnKYX&ws_ab_test=searchweb0_0,searchweb201602_8_10065_10068_319_10059_10884_317_10887_10696_321_322_10084_453_10083_454_10103_10618_10307_10712_537_536_10713,searchweb201603_6,ppcSwitch_0&algo_expid=a6603273-86eb-4c82-9731-7074a189bd2d-21&algo_pvid=a6603273-86eb-4c82-9731-7074a189bd2d&transAbTest=ae803_3


https://www.aliexpress.com/item/2-2-2-2-Inch-240-320-Dots-SPI-interface-TFT-LCD-Serial-Port-Board-Module/32961707453.html?spm=2114.search0104.3.34.1500782cnTqXVJ&ws_ab_test=searchweb0_0,searchweb201602_8_10065_10068_319_10059_10884_317_10887_10696_321_322_10084_453_10083_454_10103_10618_10307_10712_537_536_10713,searchweb201603_6,ppcSwitch_0&algo_expid=4959ea2d-9aef-4fed-b63f-b1351e372040-5&algo_pvid=4959ea2d-9aef-4fed-b63f-b1351e372040&transAbTest=ae803_3

( if you want to use this model with ef03407, you should remove acrylic front cover since it has additional MISO pin )


update :


compatible with elecfreaks EF03407 joystick:bit.


support not only st7735 but also ili9341
