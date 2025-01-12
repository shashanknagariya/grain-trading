export const TRANSPORTATION_MODES = [
  { value: 'road', label: 'Road' },
  { value: 'rail', label: 'Rail' },
  { value: 'self', label: 'Self Pickup' }
];

export const VEHICLE_NUMBER_REGEX = /^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/;
export const VEHICLE_NUMBER_FORMAT = 'Format: MP09AB1234';

export const LR_NUMBER_REGEX = /^[A-Z0-9]{8,12}$/;
export const LR_NUMBER_FORMAT = 'Format: LRXXXXXXXX';

export const PO_NUMBER_REGEX = /^PO[A-Z0-9]{6,10}$/;
export const PO_NUMBER_FORMAT = 'Format: POXXXXXX';

export const VEHICLE_NUMBER_MASK = '**99**9999';
export const LR_NUMBER_MASK = '********';
export const PO_NUMBER_MASK = 'PO999999'; 