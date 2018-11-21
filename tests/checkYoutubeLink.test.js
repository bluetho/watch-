const checkYoutubeLink = require('./checkYoutubeLink');

test('Check if the its a valid youtube url. Should return true', () => {
  expect(checkYoutubeLink("https://www.youtube.com/watch?v=Dnr8Mu1Bco4")).toBeTruthy();
});

test('Check if the its a valid youtube url. Should return false', () => {
  expect(checkYoutubeLink("https://ww.yoube.com/watch?v=Dnr8Mu1Bco4")).toBeFalsy();
});
