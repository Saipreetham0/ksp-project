
// utils/msg91.ts
import axios from 'axios';

const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY;
const MSG91_TEMPLATE_ID = process.env.MSG91_TEMPLATE_ID;

export const sendOTP = async (phoneNumber: string) => {
  try {
    const response = await axios.post(
      `https://control.msg91.com/api/v5/otp`,
      {
        template_id: MSG91_TEMPLATE_ID,
        mobile: phoneNumber,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'authkey': MSG91_AUTH_KEY,
        },
      }
    );
    return response.data;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    throw new Error('Failed to send OTP');
  }
};

export const verifyOTP = async (phoneNumber: string, otp: string) => {
  try {
    const response = await axios.post(
      `https://control.msg91.com/api/v5/otp/verify`,
      {
        otp: otp,
        mobile: phoneNumber,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'authkey': MSG91_AUTH_KEY,
        },
      }
    );
    return response.data;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    throw new Error('Invalid OTP');
  }
};