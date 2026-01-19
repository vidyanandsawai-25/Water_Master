import React, { useEffect, useState } from 'react';
import apiService, { BillingCycle } from '@/lib/api/services';

const BillingCycleTab = () => {
  const [billingCycles, setBillingCycles] = useState<BillingCycle[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    zoneID: 0,
    connectionTypeID: 0,
    cycleType: '',
    financialYear: '',
    billGenerationDate: '',
    billPeriodStart: '',
    billPeriodEnd: '',
    currentPenalty: 0,
    pendingPenalty: 0,
    isActive: true,
    createdBy: 1, // Replace with the actual user ID
  });

  // Fetch billing cycles on component mount
  useEffect(() => {
    fetchBillingCycles();
  }, []);

  const fetchBillingCycles = async () => {
    setLoading(true);
    try {
      const response = await apiService.getBillingCycles();
      setBillingCycles(response.items);
    } catch (error) {
      console.error('Error fetching billing cycles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCreateBillingCycle = async () => {
    try {
      const response = await apiService.createBillingCycle(formData);
      if (response.success) {
        alert('Billing cycle created successfully!');
        fetchBillingCycles(); // Refresh the list
      } else {
        alert('Failed to create billing cycle.');
      }
    } catch (error) {
      console.error('Error creating billing cycle:', error);
      alert('An error occurred while creating the billing cycle.');
    }
  };

  const handleDeleteBillingCycle = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this billing cycle?')) return;

    try {
      await apiService.deleteBillingCycle(id);
      alert('Billing cycle deleted successfully!');
      fetchBillingCycles(); // Refresh the list
    } catch (error) {
      console.error('Error deleting billing cycle:', error);
      alert('An error occurred while deleting the billing cycle.');
    }
  };

  return (
    <div>
      <h1>Billing Cycle Management</h1>
      <form>
        <label>
          Zone ID:
          <input
            type="number"
            name="zoneID"
            value={formData.zoneID}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Connection Type ID:
          <input
            type="number"
            name="connectionTypeID"
            value={formData.connectionTypeID}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Cycle Type:
          <input
            type="text"
            name="cycleType"
            value={formData.cycleType}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Financial Year:
          <input
            type="text"
            name="financialYear"
            value={formData.financialYear}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Bill Generation Date:
          <input
            type="date"
            name="billGenerationDate"
            value={formData.billGenerationDate}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Bill Period Start:
          <input
            type="date"
            name="billPeriodStart"
            value={formData.billPeriodStart}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Bill Period End:
          <input
            type="date"
            name="billPeriodEnd"
            value={formData.billPeriodEnd}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Current Penalty:
          <input
            type="number"
            name="currentPenalty"
            value={formData.currentPenalty}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Pending Penalty:
          <input
            type="number"
            name="pendingPenalty"
            value={formData.pendingPenalty}
            onChange={handleInputChange}
          />
        </label>
        <button type="button" onClick={handleCreateBillingCycle}>
          Create Billing Cycle
        </button>
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Zone ID</th>
              <th>Connection Type ID</th>
              <th>Cycle Type</th>
              <th>Financial Year</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {billingCycles.map((cycle) => (
              <tr key={cycle.id}>
                <td>{cycle.id}</td>
                <td>{cycle.zoneID}</td>
                <td>{cycle.connectionTypeID}</td>
                <td>{cycle.cycleType}</td>
                <td>{cycle.financialYear}</td>
                <td>
                  <button onClick={() => handleDeleteBillingCycle(cycle.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default BillingCycleTab;
