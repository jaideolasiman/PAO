const AuctionSession = require("../../models/auctionSession");
const User = require("../../models/user"); // Assuming User model exists for fetching buyer info

module.exports.results = async (req, res) => {
    try {
      const auctionSession = await AuctionSession.findOne({
        product: req.params.productId,
        endTime: { $lt: new Date() }, // Ensure the auction has ended
      })
        .populate('product')
        .populate('bids.buyer') // Assuming bids have a "buyer" reference
        .lean();
  
      if (!auctionSession) {
        req.flash("error", "Auction session not found or hasn't ended yet.");
        return res.redirect("/buyer");
      }
  
      // Find the highest bid (winning bid)
      const winningBid = auctionSession.bids.reduce((max, bid) => bid.amount > max.amount ? bid : max, auctionSession.bids[0]);
  
      // Collect bid rankings
      const bidRanking = auctionSession.bids
        .sort((a, b) => b.amount - a.amount) // Sort by bid amount descending
        .map((bid, index) => ({
          rank: index + 1,
          name: bid.buyer ? `${bid.buyer.firstName} ${bid.buyer.lastName}` : 'Anonymous',
          bidAmount: bid.amount,
        }));
  
      // Prepare winner and product data
      const winner = winningBid ? {
        name: `${winningBid.buyer.firstName} ${winningBid.buyer.lastName}`,
        phone: winningBid.buyer.phone,  // Assuming phone is stored in the buyer object
        bidAmount: winningBid.amount,
        profilePicture: winningBid.buyer.profilePicture || '/default.jpg',
      } : null;
  
      res.render("auctionResult", {
        site_title: "Auction Result",
        auctionSession,
        winner,
        bids: bidRanking,
      });
    } catch (error) {
      console.error("Error fetching auction results:", error);
      req.flash("error", "Something went wrong.");
      res.redirect("/buyer");
    }
  };
  