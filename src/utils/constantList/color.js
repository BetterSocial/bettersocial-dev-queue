const BetterSocialColorList = [];

function pushToColorList(color, code) {
  BetterSocialColorList.push({
    color,
    code
  });
}

pushToColorList('Blue', '#2F58CD');
pushToColorList('Red', '#B32A2A');
pushToColorList('Green', '#027000');
pushToColorList('Navy', '#11468F');
pushToColorList('Golden', '#FFD700');
pushToColorList('Teal', '#008080');
pushToColorList('Silver', '#C0C0C0');
pushToColorList('Bronze', '#CD7F32');
pushToColorList('Purple', '#BE55FF');
pushToColorList('Maroon', '#800000');
pushToColorList('Yellow', '#DEDE00');
pushToColorList('Pink', '#FF9DAE');
pushToColorList('Olive', '#808000');
pushToColorList('Cyan', '#A8FFFF');
pushToColorList('Orange', '#FFA500');
pushToColorList('Gray', '#808080');
pushToColorList('Beige', '#F0F0AF');
pushToColorList('Amber', '#FFBF00');
pushToColorList('Crimson', '#DC143C');
pushToColorList('Magenta', '#BA43BA');
pushToColorList('Violet', '#640BBD');
pushToColorList('Mint', '#3EB489');

module.exports = BetterSocialColorList;
