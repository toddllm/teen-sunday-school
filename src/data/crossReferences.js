/**
 * Cross-Reference Database
 *
 * Maps Bible verses to related verses across Scripture.
 * Categories:
 * - quotation: Direct quote from OT in NT
 * - parallel: Similar account/event in different books
 * - theme: Related theological theme
 * - allusion: Indirect reference
 * - prophecy: Prophecy and fulfillment
 */

export const crossReferences = {
  // John 3:16 - God's Love and Salvation
  'JHN.3.16': [
    { target: 'ROM.5.8', type: 'theme', description: 'God demonstrates His love' },
    { target: '1JN.4.9', type: 'theme', description: 'God\'s love revealed through His Son' },
    { target: 'JHN.1.29', type: 'theme', description: 'Lamb of God who takes away sin' },
    { target: 'EPH.2.8-9', type: 'theme', description: 'Saved by grace through faith' },
    { target: 'ROM.6.23', type: 'theme', description: 'Gift of God is eternal life' },
    { target: 'TIT.3.4-5', type: 'theme', description: 'God\'s kindness and love appeared' }
  ],

  // Romans 8:28 - God Works for Good
  'ROM.8.28': [
    { target: 'GEN.50.20', type: 'theme', description: 'Joseph: What was meant for evil, God meant for good' },
    { target: 'JER.29.11', type: 'theme', description: 'Plans to prosper you and not to harm you' },
    { target: 'PHP.1.6', type: 'theme', description: 'He who began a good work will complete it' },
    { target: 'ROM.8.29-30', type: 'theme', description: 'Predestined, called, justified, glorified' }
  ],

  // Philippians 4:13 - Strength in Christ
  'PHP.4.13': [
    { target: '2CO.12.9-10', type: 'theme', description: 'My grace is sufficient' },
    { target: 'ISA.40.31', type: 'theme', description: 'Those who hope in the Lord renew strength' },
    { target: 'EPH.3.16', type: 'theme', description: 'Strengthened with power through His Spirit' },
    { target: 'COL.1.11', type: 'theme', description: 'Strengthened with all power' }
  ],

  // Psalm 23 - The Lord is My Shepherd
  'PSA.23.1': [
    { target: 'JHN.10.11', type: 'theme', description: 'I am the good shepherd' },
    { target: 'EZK.34.15', type: 'theme', description: 'I myself will tend my sheep' },
    { target: 'HEB.13.20', type: 'theme', description: 'Great Shepherd of the sheep' },
    { target: '1PE.5.4', type: 'theme', description: 'Chief Shepherd will appear' }
  ],

  // Matthew 28:19-20 - Great Commission
  'MAT.28.19-20': [
    { target: 'MRK.16.15', type: 'parallel', description: 'Go into all the world and preach' },
    { target: 'ACT.1.8', type: 'theme', description: 'You will be my witnesses' },
    { target: 'MAT.28.18', type: 'theme', description: 'All authority has been given to Me' }
  ],

  // Jeremiah 29:11 - Plans to Prosper
  'JER.29.11': [
    { target: 'ROM.8.28', type: 'theme', description: 'God works all things for good' },
    { target: 'PRO.3.5-6', type: 'theme', description: 'Trust in the Lord with all your heart' },
    { target: 'PSA.37.4', type: 'theme', description: 'Delight in the Lord' }
  ],

  // Proverbs 3:5-6 - Trust in the Lord
  'PRO.3.5-6': [
    { target: 'PSA.37.5', type: 'theme', description: 'Commit your way to the Lord' },
    { target: 'ISA.26.3', type: 'theme', description: 'Perfect peace for those who trust' },
    { target: 'JER.17.7-8', type: 'theme', description: 'Blessed is the one who trusts' }
  ],

  // Romans 3:23 - All Have Sinned
  'ROM.3.23': [
    { target: 'ROM.6.23', type: 'theme', description: 'Wages of sin is death' },
    { target: 'ISA.53.6', type: 'theme', description: 'All we like sheep have gone astray' },
    { target: '1JN.1.8', type: 'theme', description: 'If we claim to be without sin' },
    { target: 'ROM.5.12', type: 'theme', description: 'Sin entered the world through one man' }
  ],

  // Ephesians 2:8-9 - Saved by Grace
  'EPH.2.8-9': [
    { target: 'TIT.3.5', type: 'theme', description: 'Not by works of righteousness' },
    { target: 'ROM.3.24', type: 'theme', description: 'Justified freely by His grace' },
    { target: 'ROM.4.5', type: 'theme', description: 'Faith credited as righteousness' },
    { target: 'GAL.2.16', type: 'theme', description: 'Not justified by works of the law' }
  ],

  // Isaiah 53:5 - By His Wounds We Are Healed
  'ISA.53.5': [
    { target: '1PE.2.24', type: 'quotation', description: 'By his wounds you have been healed' },
    { target: 'ISA.53.6', type: 'theme', description: 'The Lord laid on him the iniquity of us all' },
    { target: 'MAT.8.17', type: 'quotation', description: 'He took our infirmities' }
  ],

  // 1 Peter 2:24 - He Bore Our Sins
  '1PE.2.24': [
    { target: 'ISA.53.5', type: 'allusion', description: 'Pierced for our transgressions' },
    { target: 'ISA.53.12', type: 'allusion', description: 'Bore the sin of many' },
    { target: '2CO.5.21', type: 'theme', description: 'God made him to be sin for us' }
  ],

  // Psalm 119:105 - Your Word is a Lamp
  'PSA.119.105': [
    { target: 'PSA.119.11', type: 'theme', description: 'I have hidden your word in my heart' },
    { target: '2TI.3.16', type: 'theme', description: 'All Scripture is God-breathed' },
    { target: 'HEB.4.12', type: 'theme', description: 'Word of God is living and active' },
    { target: 'JHN.1.1', type: 'theme', description: 'In the beginning was the Word' }
  ],

  // Matthew 6:33 - Seek First the Kingdom
  'MAT.6.33': [
    { target: 'MAT.6.25-32', type: 'theme', description: 'Do not worry about your life' },
    { target: 'PHP.4.19', type: 'theme', description: 'God will meet all your needs' },
    { target: 'PSA.37.4', type: 'theme', description: 'Delight in the Lord' }
  ],

  // Acts 1:8 - You Will Be My Witnesses
  'ACT.1.8': [
    { target: 'MAT.28.19-20', type: 'parallel', description: 'Great Commission' },
    { target: 'LUK.24.47-49', type: 'parallel', description: 'Repentance and forgiveness preached' },
    { target: 'JHN.20.21', type: 'theme', description: 'As the Father sent me, I am sending you' }
  ],

  // Hebrews 11:1 - Faith Definition
  'HEB.11.1': [
    { target: '2CO.5.7', type: 'theme', description: 'We live by faith, not by sight' },
    { target: 'ROM.8.24-25', type: 'theme', description: 'Hope that is seen is no hope at all' },
    { target: 'HEB.11.6', type: 'theme', description: 'Without faith it is impossible to please God' }
  ],

  // James 1:2-4 - Consider it Joy
  'JAS.1.2-4': [
    { target: 'ROM.5.3-5', type: 'theme', description: 'We rejoice in our sufferings' },
    { target: '1PE.1.6-7', type: 'theme', description: 'Trials have come to prove your faith' },
    { target: 'JAS.1.12', type: 'theme', description: 'Blessed is the one who perseveres' }
  ],

  // 1 Corinthians 13:4-7 - Love Is Patient
  '1CO.13.4-7': [
    { target: '1CO.13.13', type: 'theme', description: 'Faith, hope, love - greatest is love' },
    { target: 'JHN.13.34-35', type: 'theme', description: 'Love one another' },
    { target: '1JN.4.7-8', type: 'theme', description: 'God is love' },
    { target: 'COL.3.14', type: 'theme', description: 'Love binds them all together' }
  ],

  // Matthew 5:16 - Let Your Light Shine
  'MAT.5.16': [
    { target: 'MAT.5.14', type: 'theme', description: 'You are the light of the world' },
    { target: 'JHN.8.12', type: 'theme', description: 'I am the light of the world' },
    { target: 'EPH.5.8', type: 'theme', description: 'You were once darkness, but now light' },
    { target: 'PHP.2.15', type: 'theme', description: 'Shine like stars in the universe' }
  ],

  // Joshua 1:9 - Be Strong and Courageous
  'JOS.1.9': [
    { target: 'DEU.31.6', type: 'allusion', description: 'Be strong and courageous' },
    { target: 'PSA.27.1', type: 'theme', description: 'The Lord is my light and salvation' },
    { target: 'ISA.41.10', type: 'theme', description: 'Do not fear, for I am with you' }
  ],

  // Galatians 5:22-23 - Fruit of the Spirit
  'GAL.5.22-23': [
    { target: 'JHN.15.5', type: 'theme', description: 'Remain in me, bear much fruit' },
    { target: 'COL.3.12-14', type: 'theme', description: 'Clothe yourselves with compassion' },
    { target: 'EPH.5.9', type: 'theme', description: 'Fruit of the light consists in goodness' }
  ],

  // Romans 12:1-2 - Living Sacrifice
  'ROM.12.1-2': [
    { target: 'PHP.2.5', type: 'theme', description: 'Have the same mindset as Christ' },
    { target: '2CO.10.5', type: 'theme', description: 'Take captive every thought' },
    { target: 'EPH.4.23', type: 'theme', description: 'Be made new in the attitude of your minds' }
  ],

  // Psalm 46:1 - God is Our Refuge
  'PSA.46.1': [
    { target: 'PSA.91.2', type: 'theme', description: 'My refuge and my fortress' },
    { target: 'NAM.1.7', type: 'theme', description: 'The Lord is good, a refuge in times of trouble' },
    { target: 'PRO.18.10', type: 'theme', description: 'Name of the Lord is a fortified tower' }
  ],

  // Revelation 21:4 - No More Death or Mourning
  'REV.21.4': [
    { target: 'ISA.25.8', type: 'allusion', description: 'He will swallow up death forever' },
    { target: '1CO.15.54', type: 'theme', description: 'Death has been swallowed up in victory' },
    { target: 'REV.7.17', type: 'theme', description: 'God will wipe away every tear' }
  ],

  // Genesis 1:1 - In the Beginning
  'GEN.1.1': [
    { target: 'JHN.1.1', type: 'allusion', description: 'In the beginning was the Word' },
    { target: 'COL.1.16', type: 'theme', description: 'All things created through Him' },
    { target: 'HEB.11.3', type: 'theme', description: 'Universe formed at God\'s command' }
  ]
};

/**
 * Get cross-references for a specific verse
 * @param {string} verseId - Verse ID in format like 'JHN.3.16'
 * @returns {Array} Array of cross-reference objects
 */
export const getCrossReferencesForVerse = (verseId) => {
  return crossReferences[verseId] || [];
};

/**
 * Get all verses that reference a specific verse
 * @param {string} verseId - Verse ID to find references to
 * @returns {Array} Array of verse IDs that reference this verse
 */
export const getReverseCrossReferences = (verseId) => {
  const results = [];
  Object.keys(crossReferences).forEach(sourceVerse => {
    const refs = crossReferences[sourceVerse];
    refs.forEach(ref => {
      if (ref.target === verseId) {
        results.push({
          source: sourceVerse,
          type: ref.type,
          description: ref.description
        });
      }
    });
  });
  return results;
};

/**
 * Get cross-references grouped by type
 * @param {string} verseId - Verse ID in format like 'JHN.3.16'
 * @returns {Object} Object with keys for each type containing arrays of references
 */
export const getCrossReferencesGrouped = (verseId) => {
  const refs = getCrossReferencesForVerse(verseId);
  const grouped = {
    quotation: [],
    parallel: [],
    theme: [],
    allusion: [],
    prophecy: []
  };

  refs.forEach(ref => {
    if (grouped[ref.type]) {
      grouped[ref.type].push(ref);
    }
  });

  return grouped;
};

export default crossReferences;
