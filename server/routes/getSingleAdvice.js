
const express = require('express');
const router = express.Router();
const { fetchRealTimeStockPrice } = require('../BuyStocks');
const csv = require('csv-parser'); // 引入 csv-parser
const fs = require('fs');
const {
    calculateMovingAverage,
    generateStrategy,
    getSuggestedFrequency,
    calculateBuyQuantity
} = require('../utils/singleAdviceFunction');

router.get('/advice', async (req, res) => {
    const stockTicker = req.query.stock;
    const period = parseInt(req.query.period, 10); // 1,2,5 year
    const initialCapital = parseFloat(req.query.capital); // initial capital

    // Automatically set the risk percentage and stop-loss percentage based on the investment horizon.
    let stopLossPercentage;
    let riskPercentage;

    if (period === 1) { // Short-term investment (1 year)
        stopLossPercentage = 5; // Stop-loss percentage: 5%
        riskPercentage = 2; // Risk percentage: 2%
    } else if (period === 2) { // Mid-term investment(2 year)
        stopLossPercentage = 10; // Stop-loss percentage: 10%
        riskPercentage = 3; // Risk percentage: 3%
    } else if (period === 5) { // Short-term investment（5 year）
        stopLossPercentage = 15; // Stop-loss percentage: 15%
        riskPercentage = 3; // Risk percentage: 3%
    } else {
        return res.json({ success: false, message: 'Invalid period specified.' });
    }

    // Read historical stock data.
    const stockData = [];
    fs.createReadStream(__dirname + '/output.csv')
        .pipe(csv())
        .on('data', (row) => {
            if (row['DATE/TICKER'] && row[stockTicker]) {
                const price = parseFloat(row[stockTicker]);
                // Validate whether the price is a valid number.
                if (!isNaN(price) && price >= 0) {
                    stockData.push({ date: row['DATE/TICKER'], price: price });
                }
            }
        })
        .on('end', async () => {
            if (stockData.length === 0) {
                return res.json({ success: false, message: '没有有效的股票数据可用' });
            }
            // Call `fetchRealTimeStockPrice` to get the real-time price.
            let realTimePrice;
            try {
                realTimePrice = await fetchRealTimeStockPrice(stockTicker);
                console.log(realTimePrice);
            } catch (error) {
                console.log('Error fetching real-time stock price:', error.message);
                return res.json({ success: false, message: 'Error fetching real-time stock price' });
            }

            // Perform technical analysis based on `stockData`.
            const movingAverage = calculateMovingAverage(stockData, period);
            if (movingAverage.length === 0) {
                return res.json({ success: false, message: 'cannot calculate moving average' });
            }

            const { strategy, buyQuantity } = generateStrategy(stockData, movingAverage, initialCapital, stopLossPercentage, riskPercentage);
            const frequency = getSuggestedFrequency(period);

            res.json({
                success: true,
                strategy: strategy,
                buyQuantity: buyQuantity,
                frequency: frequency,
                currentPrice:realTimePrice
            });
        })
        .on('error', (err) => {
            console.log('Error:', err);
            res.json({ success: false, message: 'error in reading ticker symbol data' });
        });
});

module.exports = router;