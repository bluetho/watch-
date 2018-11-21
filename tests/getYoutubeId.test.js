const getYoutubeId = require('./getYoutubeId');

test('Return the youtube v key', () => {
  expect(getYoutubeId("https://www.youtube.com/watch?v=Dnr8Mu1Bco4")).toBe("Dnr8Mu1Bco4");
});
