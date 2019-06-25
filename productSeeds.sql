USE bamazonDB;

INSERT INTO products (product_name, description, department_name, price, stock_quantity)
VALUES ("Flysky FS-i6X", "6 channel RC transmitter.", "Toys/Hobbies", 54.95, 100),
	("Sphero BB-8", "RC BB-8 by Sphero.", "Toys/Hobbies", 149.00, 9),
	("Barbie Dream House", "A luxurious home for your Barbie dolls.", "Toys/Hobbies", 99.95, 3),
	("Dell laptop", "15.4 inch, 4GB RAM, 1TB hard drive.", "Electronics", 695.00, 25),
	("Bamazon Icecube", "Take over the world with one device.", "Electronics", 1000000.00, 1),
	("MP3 Player", "Portable MP3 player, comes in 6 colors.", "Electronics", 14.99, 125),
	("Polo Shirt", "Men's Polo in various colors and sizes.", "Men's Clothing", 14.29, 75),
	("Thoroughgood Work Boots", "All leather, union-made work boots.", "Men's Clothing", 225.79, 12),
	("Khakis", "Comfortable khaki pants by Dockers.", "Men's Clothing", 24.99, 100),
	("Little Black Dress", "It's a little black dress, really.", "Women's Clothing", 74.29, 20),
	("Black Handbag", "Totally goes with everything.", "Women's Clothing", 92.50, 45),
	("Scarf", "Beatiful handmade floral print scarf.", "Women's Clothing", 8.50, 120),
	("Hip waders", "Waders for stream fishing in various sizes.", "Outdoors", 37.67, 3),
	("PSE Recurve Bow", "Aluminum riser with composite limbs.", "Outdoors", 257.49, 25),
	("Coleman Tent", "Spacious 6-man tent with rain-fly.", "Outdoors", 149.99, 100),
	("Tektronix 2430", "150 MHz Oscilloscope.", "Industrial/Scientific", 2499.00, 40),
	("Arduino Starter Pack", "Beginner's microcontroller kit.", "Industrial/Scientific", 47.90, 13),
	("Digital Multimeter", "Multi-function DMM with 4-1/2 digit display.", "Industrial/Scientific", 99.99, 15),
	("Programming for 'Dummies'", "Fascinating read by David Bauer. 160pp.", "Kindling Books", 4.60, 1000), -- Can't give these things away!
	("Importance of Early Childhood Literacy", "By Dr. Christina Bauer. 228pp.", "Kindling Books", 9.99, 13),
	("The Complete Star Wars Universe", "Everything Star Wars is in here! 1138pp.", "Kindling Books", 48.72, 50);
