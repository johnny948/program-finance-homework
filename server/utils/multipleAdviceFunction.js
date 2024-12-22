const fs = require('fs');
const csv = require('csv-parser');
const express = require('express');
const router = express.Router();
const math = require('mathjs');
// fill the missing date
function fillMissingDates(stockData, allDates) {
    const dates = Array.from(allDates).sort((a, b) => a - b);  // Sort all the dates.
    const dateSet = new Set(dates);  // Create a date set for fast lookup.

    // Fill in the data for each stock.
    const filledData = [];
    let currentIndex = 0;

    // Iterate through all the dates.
    dates.forEach(date => {
        if (stockData[currentIndex] && stockData[currentIndex].date === date) {

            filledData.push(stockData[currentIndex]);
            currentIndex++;
        } else {

            const previousPrice = filledData[filledData.length - 1]?.price || 0;
            filledData.push({ date: date, price: previousPrice });
        }
    });

    // update stock data
    stockData.length = 0;
    stockData.push(...filledData);
}

// calculate the daily return of a stock, you can use the formula
function calculateReturns(prices) {
    const returns = [];
    for (let i = 1; i < prices.length; i++) {
        const dailyReturn = (prices[i] - prices[i - 1]) / prices[i - 1];
        returns.push(dailyReturn);
    }
    console.log(returns);
    return returns;
}


function calculateStandardDeviation(returns) {
    // check whether it contains Infinity 或 -Infinity
    const invalidValues = returns.filter(r => r === Infinity || r === -Infinity);
    if (invalidValues.length > 0) {
        console.error('Invalid values found in returns array:', invalidValues);
        return NaN;
    }

    // calculate means
    const mean = math.mean(returns);
    console.log('Mean:', mean);

    // calculate variance
    const variance = math.mean(returns.map(r => Math.pow(r - mean, 2)));
    console.log('Variance:', variance);

    // calculate stddev
    const stddev = Math.sqrt(variance);
    console.log('Standard Deviation:', stddev);

    return stddev;
}


// calculate correlation
function calculateCorrelation(returns1, returns2) {
    return math.corr(returns1, returns2);
}

// Mean-variance optimization (simple version: the goal is to minimize risk).
function meanVarianceOptimization(stocksData) {
    const returns = stocksData.map(stock => calculateReturns(stock.prices));
    const risks = stocksData.map(stock => calculateStandardDeviation(returns[stocksData.indexOf(stock)]));

    const n = stocksData.length;
    const correlationMatrix = [];

    // Calculate the correlation matrix between stocks.
    for (let i = 0; i < n; i++) {
        let row = [];
        for (let j = 0; j < n; j++) {
            if (i === j) {
                row.push(1);
            } else {
                const correlation = calculateCorrelation(returns[i], returns[j]);
                row.push(correlation);  // store the correlation
            }
        }
        correlationMatrix.push(row);
    }

    // When calculating the initial weight of each stock, consider the risk.
    const totalRisk = risks.reduce((acc, risk) => acc + risk, 0);
    const initialWeights = risks.map(risk => risk / totalRisk);  // Distribute the initial weights based on risk.

    // Adjust the weights further based on correlation.
    const adjustedWeights = initialWeights.map((weight, index) => {
        // Adjust the weights individually based on correlation.
        let adjustedWeight = weight;

        for (let j = 0; j < n; j++) {
            if (index !== j) {
                adjustedWeight *= (1 - Math.abs(correlationMatrix[index][j]));  // Adjust the weights based on correlation.
            }
        }
        return adjustedWeight;
    });

    // Calculate the sum of the adjusted weights.
    const totalAdjustedWeight = adjustedWeights.reduce((acc, weight) => acc + weight, 0);

    // Normalize the weights so that their total sum is 1 or 100%
    const finalWeights = adjustedWeights.map(weight => weight / totalAdjustedWeight);

    // return the optimized weights
    return finalWeights;
}
module.exports = {
    fillMissingDates,
    calculateReturns,
    calculateStandardDeviation,
    calculateCorrelation,
    meanVarianceOptimization
};