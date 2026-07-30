import React, { useState } from 'react';
import { Plus, Edit2, Eye, Download, Calendar, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const initialMenu = [
  { id: 1, day: 'Monday', breakfast: 'Idli Sambhar, Coconut Chutney, Tea', lunch: 'Roti, Rice, Dal Fry, Seasonal Veg, Curd', snacks: 'Veg Cutlet, Tea', dinner: 'Roti, Khichdi, Kadhi, Papad' },
  { id: 2, day: 'Tuesday', breakfast: 'Aloo Paratha, Curd, Pickle, Tea', lunch: 'Roti, Rice, Dal Tadka, Paneer Butter Masala, Salad', snacks: 'Samosa, Tea', dinner: 'Roti, Mix Veg, Veg Pulav, Custard' },
  { id: 3, day: 'Wednesday', breakfast: 'Poha, Jalebi, Sprouts, Milk/Tea', lunch: 'Roti, Rice, Dal Makhani, Dum Aloo, Papad', snacks: 'Bread Pakoda, Tea', dinner: 'Roti, Rice, Green Salad, Dal Fry, Seasonal Veg' },
  { id: 4, day: 'Thursday', breakfast: 'Bread Butter/Jam, Omelette, Tea', lunch: 'Roti, Veg Biryani, Raita, Chole Bhature', snacks: 'Dhokla, Tea', dinner: 'Roti, Rice, Yellow Dal, Bhindi Bhurji' },
  { id: 5, day: 'Friday', breakfast: 'Veg Sandwich, Sprouts, Tea', lunch: 'Roti, Rice, Rajma, Kadai Paneer, Salad', snacks: 'Kachori, Tea', dinner: 'Roti, Rice, Dal Tadka, Aloo Gobhi, Kheer' },
];

const MealMenu = () => {
  const [menu, setMenu] = useState(initialMenu);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSpecial, setNewSpecial] = useState({
    day: 'Sunday',
    breakfast: 'Chole Bhature, Sweet Lassi',
    lunch: 'Jeera Rice, Butter Roti, Paneer Makhani, Gulab Jamun',
    snacks: 'Pav Bhaji, Tea',
    dinner: 'Special Veg Pulao, Dal Fry, Roti, Ice Cream'
  });

  const handlePublish = () => {
    toast.success('Weekly mess menu published and student notification broadcasted!');
  };

  const handleAddSpecial = (e) => {
    e.preventDefault();
    setMenu([...menu, {
      id: menu.length + 1,
      day: newSpecial.day + ' (Special)',
      breakfast: newSpecial.breakfast,
      lunch: newSpecial.lunch,
      snacks: newSpecial.snacks,
      dinner: newSpecial.dinner
    }]);
    setShowAddModal(false);
    toast.success('Special meal menu successfully configured!');
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full font-['Inter']">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-bold text-gray-800">Weekly Meal Menu Configuration</h2>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Design weekly meal rotations and publish holiday banquet updates</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Plus size={15} /> Add Special Meal
          </button>
          <button onClick={handlePublish} className="bg-[#0A6C54] hover:bg-[#085a46] text-white px-5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors">
            <Save size={16} /> Publish & Broadcast
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Day</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Breakfast (07:30 - 09:00)</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Lunch (12:30 - 14:00)</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Snacks (17:00 - 18:00)</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Dinner (20:00 - 21:30)</th>
              <th className="py-4 px-6 text-[12px] font-bold text-gray-800">Actions</th>
            </tr>
          </thead>
          <tbody>
            {menu.map(item => (
              <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-6 text-[13px] font-bold text-gray-900">{item.day}</td>
                <td className="py-4 px-6 text-[13px] text-gray-600 font-medium">{item.breakfast}</td>
                <td className="py-4 px-6 text-[13px] text-gray-600 font-medium">{item.lunch}</td>
                <td className="py-4 px-6 text-[13px] text-gray-600 font-medium">{item.snacks}</td>
                <td className="py-4 px-6 text-[13px] text-gray-600 font-medium">{item.dinner}</td>
                <td className="py-4 px-6 flex gap-2">
                  <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors" title="Edit Day Menu"><Edit2 size={15} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Special Meal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 text-[15px]">Configure Special Meal</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 text-lg font-semibold">&times;</button>
            </div>
            <form onSubmit={handleAddSpecial} className="p-6 space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Occasion / Day</label>
                <input 
                  type="text" 
                  required
                  value={newSpecial.day}
                  onChange={(e) => setNewSpecial({...newSpecial, day: e.target.value})}
                  placeholder="e.g. Festival Banquet / Sunday Feast"
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Breakfast Menu</label>
                <input 
                  type="text" 
                  required
                  value={newSpecial.breakfast}
                  onChange={(e) => setNewSpecial({...newSpecial, breakfast: e.target.value})}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Lunch Menu</label>
                <input 
                  type="text" 
                  required
                  value={newSpecial.lunch}
                  onChange={(e) => setNewSpecial({...newSpecial, lunch: e.target.value})}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Snacks Menu</label>
                <input 
                  type="text" 
                  required
                  value={newSpecial.snacks}
                  onChange={(e) => setNewSpecial({...newSpecial, snacks: e.target.value})}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-600 mb-1">Dinner Menu</label>
                <input 
                  type="text" 
                  required
                  value={newSpecial.dinner}
                  onChange={(e) => setNewSpecial({...newSpecial, dinner: e.target.value})}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-[13px]"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-lg text-[13px] font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 bg-[#0A6C54] hover:bg-[#085a46] text-white rounded-lg text-[13px] font-semibold"
                >
                  Save Banquet Menu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealMenu;
