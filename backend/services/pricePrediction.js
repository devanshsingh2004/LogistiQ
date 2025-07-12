const { Deal } = require('../models');

async function getSuggestedPrice(quantity_tons, pickup_location, delivery_location, distance_km){
  
  const deals = await Deal.findAll({
    limit: 100,
    order: [['created_at', 'DESC']],
  });

  if (!deals || deals.length === 0) {
    return 0.0;
  }

  let totalRatePerKmTon = 0.0;
  let count = 0;

  for (let d of deals) {
    if (d.quantity_tons > 0) {
      totalRatePerKmTon += parseFloat(d.deal_amount) / (d.quantity_tons*d.distance_km);
      count++;
    }
  }

  if (count === 0) return 0.0;

  const avgRatePerKmTon = totalRatePerKmTon / count; 
  
  return parseFloat(avgRatePerKmTon.toFixed(2));
}

module.exports = { getSuggestedPrice };
