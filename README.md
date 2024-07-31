# ParkingPrinter
This is a demo showing how to build a small parking system and store, on an excel file the information.

Most of the data is hardcoded in order not to delay the demo.

It is based on a 80mm thermal printer on MS Windows system.

### Notes:
The printing of the logo can be done, but doing a temp file with all the HTML and CSS all together.

If not, the printing will not print the image.

You can change the code to use a .env file in order to not hardcode some values (such as the hour price of the parking), to accomplish this, you should add dotenv and modify values upon loading complete.

I used the first line of the Excel file in order to get the header values (by checking non empty), you acn achieve this in many other ways. This was an easy one.

Last but not least, It's not finished the search input nor the show of completed vehicles.
To be done in next presentations.
## To run  it: 
Thermal printer need to be default printer for it to work

`npm install` <== to install libraries the first time

`npx electron .` <== to execute it