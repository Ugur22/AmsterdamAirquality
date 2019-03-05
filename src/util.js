// GENERATE RANDOM NUMBER WITHIN GIVEN RANGE WITH NORMALNESS PARAMETER (1-6). NORMALNESS = 6 GIVES NORMAL DISTRIBUTION
export const random = function(min, max, normalness = 1) {
  var rand = 0

  for (var i = 0; i < normalness; i += 1) {
    rand += Math.random()
  }

  return Math.floor(min + rand / normalness * (max - min + 1))
}