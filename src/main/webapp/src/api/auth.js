export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', {
      fullName: userData.fullName,
      email: userData.email,
      password: userData.password,
      fathersName: userData.fathersName,
      dateOfBirth: userData.dateOfBirth,
      phoneNumber: userData.phoneNumber,
      block: userData.block,
      houseNumber: userData.houseNumber,
      aadhaarNumber: userData.aadhaarNumber,
      tshirtSize: userData.tshirtSize
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}; 