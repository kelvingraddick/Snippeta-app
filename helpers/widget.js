import SharedGroupPreferences from 'react-native-shared-group-preferences';

const APP_GROUP = 'group.com.wavelinkllc.snippeta.shared';

const saveData = async (key, value) => {
  console.log(`widget.js -> saveData: About to save data in app group for key '${key}'`);
  try {
    const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
    await SharedGroupPreferences.setItem(key, serializedValue, APP_GROUP);
    console.log(`widget.js -> saveData: Saved in app group key '${key}'`);
  } catch (error) {
    console.error('widget.js -> saveData: Error saving data to app group:', error);
  }
};

const getData = async (key) => {
  console.log(`widget.js -> getData: About to get data in app group for key '${key}'`);
  let value;
  try {
    const item = await SharedGroupPreferences.getItem(key, APP_GROUP);
    value = JSON.parse(item);
    console.log(`widget.js -> getData: Got data from app group key '${key}'`);
  } catch (error) {
    console.error('widget.js -> getData: Error getting data from app group:', error);
  }
  return value;
};

export default {
  saveData,
  getData,
};
