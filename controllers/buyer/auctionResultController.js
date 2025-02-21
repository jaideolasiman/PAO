//onst ResultAuction = require('../../models/resultAuction'); 
const AuctionSession = require('../../models/auctionSession'); // Import AuctionSession model
const Product = require('../../models/product'); // Import Product model (if needed)

module.exports.results = async (req, res) => {
    try {
        const { productId } = req.query;

        const auctionSession = await AuctionSession.findOne({ 
            'product': productId 
        })
        .populate('product')
        .populate('seller')
        .populate('buyer'); // Ensure the buyer is populated
         

        if (!auctionSession) {
            return res.status(404).render('buyer/auctionResult', {
                message: 'Auction session not found or no bids placed.',
                auctionSession: null,
                highestBid: null,
                winner: null,
                bidRanking: []
            });
        }

        

        const highestBid = auctionSession.bid;
        const winner = auctionSession.buyer;

        // Create the bidRanking array by sorting bids in descending order (highest to lowest)
        const bidRanking = auctionSession.bid
            ? auctionSession.bid
                .sort((a, b) => b.amount - a.amount)  // Sorting bids in descending order (highest to lowest)
                .map((bid, index) => ({
                    rank: index + 1,
                    bidder: bid.bidder, // The bidder is the buyer
                    bidAmount: bid.amount
                }))
            : []; // Default to an empty array if no bids exist

        const resultAuction = new auctionResult({
            product: auctionSession.product,
            highestBid: {
                bidAmount: highestBid,
                bidder: winner._id
            },
            auctionEnded: true,
            resultDate: new Date()
        });

        try {
            await resultAuction.save();
            console.log('Auction result saved:', resultAuction);
        } catch (err) {
            console.error('Error saving auction result:', err);
        }

        // Pass the bidRanking data to the view
        res.render('buyer/auctionResults', {
            auctionSession,
            highestBid,
            winner,
            bidRanking // Send the bidRanking to the view
        });

    } catch (error) {
        console.error(error);
        res.status(500).render('buyer/auctionResult', {
            message: 'An error occurred while fetching the auction result.',
            auctionSession: null,
            highestBid: null,
            winner: null,
            bidRanking: []
        });
    }
};