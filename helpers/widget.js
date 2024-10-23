import SharedGroupPreferences from 'react-native-shared-group-preferences';

const APP_GROUP = 'group.com.wavelinkllc.snippeta.shared';

const saveData = async (key, value) => {
  console.log(`widget.js -> saveData: About to save data in app group for key '${key}'`);
  try {
    await SharedGroupPreferences.setItem(key, value, APP_GROUP);
    console.log(`widget.js -> saveData: Saved in app group key '${key}' with value ${value}`);
  } catch (error) {
    console.error('widget.js -> getData: Error saving data to app group:', error);
  }
};

const getData = async (key) => {
  console.log(`widget.js -> getData: About to get data in app group for key '${key}'`);
  try {
    const value = await SharedGroupPreferences.getItem(key, APP_GROUP);
    console.log(`widget.js -> saveData: For app group key '${key}' got value ${value}`);
  } catch (error) {
    console.error('widget.js -> getData: Error getting data from app group:', error);
  }
};

export default {
  saveData,
  getData,
};
