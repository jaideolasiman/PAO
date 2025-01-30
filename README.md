# WEB-BASED MARKETPLACE FOR DIRECT FARMER-TO-CUSTOMER TRANSACTION IN LOCAL AGRICULTURE IN DIPOLOG CITY, ZAMBOANGA DEL NORTE

## Introduction

This project is a web-based marketplace designed for farmers and buyers to connect directly. The platform allows farmers to list their products, conduct auctions, and sell directly to buyers. Buyers can browse products, participate in auctions, and reserve products.



## System-Wide Features

1.	**User Authentication**

-	Secure login for all user types (Admin, Farmer, Customer) .

2.	**Retail and Wholesale Product Management**

-	Farmers can list products as Retail (fixed price for smaller quantities) or Wholesale (flexible price via     an auction system for bulk purchases).
-	Customers can filter between Retail and Wholesale products when browsing.

3.	**Auction Management (Wholesale Product)**

-	Farmers set up auctions for wholesale products with details like starting price, minimum order quantity, and auction duration.
-	Customers can participate by placing bids within the specified timeframe.

4.	**Order and Trade Management**

-	Retail: Fixed-price orders for immediate purchase.
-	Wholesale: Auctions allow price negotiation through competitive bidding.

5.	**Notification System**

-	Real-time notifications for auction updates (e.g., outbid alerts, auction results) and retail orders (e.g., order confirmation).
________________________________________

## Admin Features (Retail and Wholesale Management)

1.	**Product Oversight**

-	Monitor both retail and wholesale product listings to ensure they comply with marketplace policies.
-	Manage and resolve disputes related to auctions or trades.

2.	**Auction Monitoring**

-	Oversee ongoing auctions to ensure fairness and transparency.
-	Resolve disputes arising from auction outcomes.

3.	**Order and Trade Monitoring**

-	Track retail orders and auction-based wholesale trades.
-	Generate reports on product sales (both retail and wholesale).

4.	**System Reports**

-	Generate detailed reports on auction participation, winning bids, and overall wholesale product performance.

5.	**User Management**

-	Manage all users (Farmers and Customers), including account approval, deactivation, and conflict resolution.

6.	**Product Management**

-	View, edit, or delete product listings submitted by farmers.
-	Ensure all product details meet marketplace standards and guidelines.

7.	**Category Management**

-	Create, edit, or delete product categories to keep the marketplace organized.
-	Ensure products are appropriately categorized for easier browsing by customers.

8.	**Feedback and Review Moderation**

-	Monitor and manage customer feedback and farmer reviews to maintain a positive marketplace environment.

________________________________________


## Farmer Features (Retail and Wholesale Management)

1.	**Retail Product Listing**

-	Add products with fixed prices, specifying quantity and availability.
-	Edit or delete retail product listings as needed.

2.	**Wholesale Product Auction**
-	Create auctions for bulk sales, including:
	- Starting bid price.
	- Minimum order quantity.
	- Auction duration and closing date.
-	View bids placed by customers and select the winning bid.

3.	**Auction Updates**

-	Receive notifications for new bids, auction expiration, and winner confirmation.

4.	**Order and Trade Management**

-	Manage retail orders by confirming, rejecting, or modifying customer requests.
-	Approve winning bids from auctions and coordinate delivery/payment terms with customers.

5.	**Sales Tracking**

-	View a history of retail sales and completed auctions.
________________________________________

## Customer Features (Retail and Wholesale Management)

1.	**Retail Product Browsing and Ordering**

-	Search and filter retail products by category, price, and availability.
-	Place fixed-price orders for immediate purchases.

2.	**Wholesale Product Auction Participation**

-	View and join active auctions for wholesale products.
-	Place bids on auctions, specifying desired quantities and proposed prices.

3.	**Auction Notifications**

-	Receive alerts for:
	- Being outbid during an auction.
	- Winning an auction and next steps for completing the transaction.
	- Auction results after it closes.

4.	**Order and Trade Management**

-	Track retail order progress, including status updates from farmers.
-	Monitor bids placed on wholesale auctions and their outcomes.

5.	**Feedback and Rating System**

-	Provide feedback and ratings for farmers based on the quality of retail and wholesale products.
________________________________________

## Auction Workflow for Wholesale Products

1.	**Farmer's Perspective:**

-	Farmer creates an auction listing with the following details:
	- Product name, description, and image.
	- Minimum quantity and starting price.
	- Auction duration and closing date.
-	Farmer monitors bids and selects the highest suitable bidder once the auction ends.

2.	**Customer's Perspective:**

-	Customer views the auction, places a bid, and specifies the desired quantity.
-	If outbid, the customer can increase their bid before the auction closes.
-	Upon winning, the customer coordinates payment and delivery with the farmer.

3.	**Admin's Perspective:**

-	Admin monitors the auction process for transparency.
-	Resolves disputes if customers or farmers report issues with bidding or auction outcomes.

## Getting Started

## Setting up the classic way
- make sure you have mongodb installed and started
- create a .env file
- execute `npm install` in the command line to install the dependencies needed for the school appointment program.
- execute `npm start` in the command line to start the program.
- execute `npm start` in the command line to start the program.
