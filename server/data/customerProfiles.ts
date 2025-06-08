/**
 * Customer Profile Data
 * Real customer information for notification system testing and setup
 */

export interface CustomerProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  discordUserId?: string;
  preferences: {
    email: boolean;
    sms: boolean;
    discord: boolean;
    inApp: boolean;
  };
  notes?: string;
}

export const customerProfiles: CustomerProfile[] = [
  {
    id: 1,
    name: "Jay Stevens",
    email: "joshuastevens100@gmail.com",
    phone: "+1 832 893-3794",
    preferences: {
      email: true,
      sms: true,
      discord: true,
      inApp: true
    },
    notes: "Primary contact - Business owner"
  }
];

export function getCustomerByPhone(phone: string): CustomerProfile | undefined {
  return customerProfiles.find(customer => customer.phone === phone);
}

export function getCustomerByEmail(email: string): CustomerProfile | undefined {
  return customerProfiles.find(customer => customer.email === email);
}

export function getCustomerById(id: number): CustomerProfile | undefined {
  return customerProfiles.find(customer => customer.id === id);
}

export function addCustomer(customer: Omit<CustomerProfile, 'id'>): CustomerProfile {
  const newCustomer: CustomerProfile = {
    ...customer,
    id: Math.max(...customerProfiles.map(c => c.id)) + 1
  };
  customerProfiles.push(newCustomer);
  return newCustomer;
}

export function updateCustomerDiscordId(customerId: number, discordUserId: string): boolean {
  const customer = customerProfiles.find(c => c.id === customerId);
  if (customer) {
    customer.discordUserId = discordUserId;
    return true;
  }
  return false;
}