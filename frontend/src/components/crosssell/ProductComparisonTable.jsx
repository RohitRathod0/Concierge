import React from 'react';

const ProductComparisonTable = ({ plans }) => {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50 text-gray-700 uppercase">
          <tr>
            <th className="px-6 py-4 rounded-tl-xl font-semibold">Features</th>
            {plans.map(plan => (
              <th key={plan.id} className={`px-6 py-4 text-center font-bold ${plan.highlight ? 'text-orange-600 bg-orange-50/50' : ''}`}>
                {plan.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {plans[0].features.map((featureObj, index) => (
            <tr key={index} className="hover:bg-gray-50/50">
              <td className="px-6 py-4 font-medium text-gray-900">{featureObj.name}</td>
              {plans.map(plan => (
                <td key={plan.id} className={`px-6 py-4 text-center ${plan.highlight ? 'bg-orange-50/30' : ''}`}>
                  {plan.features[index].included ? (
                    <span className="text-green-500 font-bold">✓</span>
                  ) : (
                    <span className="text-gray-300">-</span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductComparisonTable;
