// Given a `timeframe` of the form "<number><unit>", return the corresponding
// number of seconds.  Units may be any of 's' (seconds), 'm' (minutes), 'h'
// (hours), 'd' (days), or 'w' weeks.

var secondsPer = { s: 1, m: 60, h: 3600, d: 86400, w: 604800 };

function timeframeToSeconds(timeframe) {
   var
      tf = String(timeframe),
      num = parseFloat(tf),
      units = (+timeframe !== num && tf.charAt(tf.length - 1)) || 's',
      multiplier = secondsPer[units] || NaN
   ;
   return Math.floor(num * multiplier);
}

if (require.main === module) {
  console.log(timeframeToSeconds(process.argv[2]));
}

module.exports = timeframeToSeconds;
