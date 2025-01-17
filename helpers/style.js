const getFancyActionSheetStyles = (themer) => {
  return themer ? {
    sheetStyle: { backgroundColor: themer.getColor('screenHeader1.background') },
    titleTextStyle: { color: themer.getColor('screenHeader1.foreground') },
    messageTextStyle: { color: themer.getColor('screenHeader1.foreground') },
    optionButtonStyle: { backgroundColor: themer.getColor('button3.background'), borderRadius: 50 }, optionButtonTextStyle: { color: themer.getColor('button3.foreground') },
    destructiveOptionButtonStyle: { backgroundColor: themer.getColor('button4.background'), borderRadius: 50 },
    closeButtonStyle: { backgroundColor: themer.getColor('button4.background'), borderRadius: 50 }, closeButtonIconStyle: { color: themer.getColor('button4.foreground') },
  } : null;
};

export default {
  getFancyActionSheetStyles,
};