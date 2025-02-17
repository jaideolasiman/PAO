const User = require('../../models/user');
const Order = require('../../models/order');
const AuctionSession = require('../../models/auctionSession');
const moment = require('moment');
const SITE_TITLE = 'PAO';

module.exports.index = async (req, res) => {
    try {
        const userLogin = await User.findById(req.session.login);
        if (!userLogin) {
            req.flash('error', 'Please log in first.');
            return res.redirect('/login');
        }

        // Get current month and year
        const currentDate = new Date();
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

        const startOfYear = moment().startOf('year').toDate();
        const endOfYear = moment().endOf('year').toDate();


        // Calculate total monthly sales
        const monthlySales = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startOfMonth, $lte: endOfMonth }
                }
            },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    totalSales: { $sum: "$totalPrice" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const monthlyUsers = await User.aggregate([
            {
                $match: { createdAt: { $gte: startOfYear, $lte: endOfYear } }
            },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    totalUsers: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Get auction sessions per month
        const monthlyAuctionSessions = await AuctionSession.aggregate([
            {
                $match: { createdAt: { $gte: startOfYear, $lte: endOfYear } }
            },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    totalAuctionSessions: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Convert data into an array with months
        const data = [];
        for (let i = 1; i <= 12; i++) {
            data.push({
                month: moment().month(i - 1).format('MMMM'),
                totalSales: monthlySales.find(s => s._id === i)?.totalSales || 0,
                totalUsers: monthlyUsers.find(u => u._id === i)?.totalUsers || 0,
                totalAuctionSessions: monthlyAuctionSessions.find(a => a._id === i)?.totalAuctionSessions || 0,
            });
        }

        // Calculate grand totals
        const totalSalesAll = data.reduce((sum, item) => sum + item.totalSales, 0);
        const totalUsersAll = data.reduce((sum, item) => sum + item.totalUsers, 0);
        const totalAuctionSessionsAll = data.reduce((sum, item) => sum + item.totalAuctionSessions, 0);

        const totalMonthlySales = monthlySales.length > 0 ? monthlySales[0].totalSales : 0;
          // Get total users count
          const totalUsers = await User.countDocuments();

        const totalAuctionSessions = await AuctionSession.countDocuments({
            createdAt: { $gte: startOfMonth, $lte: endOfMonth }
        });

        res.render('admin/index.ejs', {
            site_title: SITE_TITLE,
            title: 'Home',
            req: req,
            messages: req.flash(),
            userLogin: userLogin,
            currentUrl: req.originalUrl,
            totalUsers: totalUsers,
            monthlySales: totalMonthlySales, // Pass the data to EJS
            totalAuctionSessions: totalAuctionSessions, // Pass auction sessions count
            startOfYear,
            endOfYear,
            data: data,
            monthlyUsers,
            monthlyAuctionSessions,
            totalSalesAll,
            totalUsersAll,
            totalAuctionSessionsAll
        });
    } catch (error) {
        console.error('Error loading dashboard:', error);
        req.flash('error', 'Something went wrong.');
        res.redirect('/login');
    }
};