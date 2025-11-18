/**
 * Biblical Characters Database
 *
 * Provides profiles for key biblical characters including:
 * - Basic info (name, alternate names)
 * - Summary of their life and significance
 * - Primary Bible passages where they appear
 * - Key life events
 * - Relationships with other biblical figures
 */

export const biblicalCharacters = [
  // Old Testament - Patriarchs
  {
    id: 'abraham',
    name: 'Abraham',
    altNames: ['Abram'],
    summary: 'The father of the Hebrew nation and a man of great faith. God called him to leave his homeland and promised to make him into a great nation. Known for his willingness to sacrifice his son Isaac.',
    primaryPassages: [
      { book: 'Genesis', chapters: '12-25', note: 'Abraham\'s life story' },
      { book: 'Genesis', chapter: 12, verses: '1-3', note: 'God\'s call and promise' },
      { book: 'Genesis', chapter: 22, verses: '1-19', note: 'Testing of Abraham\'s faith' },
      { book: 'Romans', chapter: 4, verses: '1-25', note: 'Abraham\'s faith as example' }
    ],
    keyLifeEvents: [
      'Called by God to leave Ur',
      'Promised a great nation despite old age',
      'Birth of Ishmael through Hagar',
      'Covenant and circumcision',
      'Birth of Isaac in old age',
      'Willingness to sacrifice Isaac',
      'Death at 175 years old'
    ],
    relationships: [
      { characterId: 'sarah', type: 'spouse', description: 'Wife and mother of Isaac' },
      { characterId: 'isaac', type: 'child', description: 'Son of promise' },
      { characterId: 'lot', type: 'nephew', description: 'Nephew who separated from Abraham' }
    ],
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sarah',
    name: 'Sarah',
    altNames: ['Sarai'],
    summary: 'Wife of Abraham and mother of Isaac. Despite being barren until old age, she gave birth to the child of promise, demonstrating God\'s faithfulness.',
    primaryPassages: [
      { book: 'Genesis', chapter: 18, verses: '1-15', note: 'Promise of a son' },
      { book: 'Genesis', chapter: 21, verses: '1-7', note: 'Birth of Isaac' },
      { book: 'Hebrews', chapter: 11, verse: '11', note: 'Faith commended' },
      { book: '1 Peter', chapter: 3, verses: '5-6', note: 'Example of holy women' }
    ],
    keyLifeEvents: [
      'Married Abraham in Ur',
      'Traveled with Abraham to Canaan',
      'Gave Hagar to Abraham as surrogate',
      'Received promise of a son at 90',
      'Laughed at the promise',
      'Gave birth to Isaac at 90',
      'Died at 127 years old'
    ],
    relationships: [
      { characterId: 'abraham', type: 'spouse', description: 'Husband and partner in faith' },
      { characterId: 'isaac', type: 'child', description: 'Son born in her old age' }
    ],
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'isaac',
    name: 'Isaac',
    altNames: [],
    summary: 'The promised son of Abraham and Sarah, and father of Jacob and Esau. His near-sacrifice demonstrated God\'s provision and his peaceful nature helped maintain covenant blessings.',
    primaryPassages: [
      { book: 'Genesis', chapter: 22, verses: '1-19', note: 'Binding of Isaac' },
      { book: 'Genesis', chapter: 24, verses: '1-67', note: 'Marriage to Rebekah' },
      { book: 'Genesis', chapters: '25-27', note: 'Isaac\'s life and family' }
    ],
    keyLifeEvents: [
      'Born to Abraham and Sarah in their old age',
      'Nearly sacrificed by Abraham',
      'Married Rebekah',
      'Father of twins Jacob and Esau',
      'Blessed Jacob instead of Esau',
      'Lived to 180 years old'
    ],
    relationships: [
      { characterId: 'abraham', type: 'parent', description: 'Father' },
      { characterId: 'sarah', type: 'parent', description: 'Mother' },
      { characterId: 'rebekah', type: 'spouse', description: 'Wife' },
      { characterId: 'jacob', type: 'child', description: 'Younger son who received the blessing' },
      { characterId: 'esau', type: 'child', description: 'Older son who sold birthright' }
    ],
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'jacob',
    name: 'Jacob',
    altNames: ['Israel'],
    summary: 'Son of Isaac who became the father of the twelve tribes of Israel. Known for wrestling with God and having his name changed to Israel, meaning "he struggles with God."',
    primaryPassages: [
      { book: 'Genesis', chapters: '25-50', note: 'Jacob\'s life story' },
      { book: 'Genesis', chapter: 32, verses: '22-32', note: 'Wrestling with God' },
      { book: 'Genesis', chapter: 28, verses: '10-22', note: 'Jacob\'s ladder vision' }
    ],
    keyLifeEvents: [
      'Born holding Esau\'s heel',
      'Bought Esau\'s birthright for stew',
      'Deceived Isaac to receive blessing',
      'Fled to Haran to escape Esau\'s anger',
      'Vision of ladder to heaven',
      'Worked 14 years for Rachel',
      'Wrestled with God, renamed Israel',
      'Reconciled with Esau',
      'Father of 12 sons (tribes of Israel)'
    ],
    relationships: [
      { characterId: 'isaac', type: 'parent', description: 'Father' },
      { characterId: 'rebekah', type: 'parent', description: 'Mother' },
      { characterId: 'esau', type: 'sibling', description: 'Twin brother' },
      { characterId: 'rachel', type: 'spouse', description: 'Beloved wife' },
      { characterId: 'joseph', type: 'child', description: 'Favorite son' }
    ],
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'joseph',
    name: 'Joseph',
    altNames: [],
    summary: 'Son of Jacob who was sold into slavery by his brothers but rose to become second-in-command of Egypt. His story demonstrates God\'s sovereignty and forgiveness.',
    primaryPassages: [
      { book: 'Genesis', chapters: '37-50', note: 'Joseph\'s complete story' },
      { book: 'Genesis', chapter: 37, verses: '1-36', note: 'Sold into slavery' },
      { book: 'Genesis', chapter: 41, verses: '1-57', note: 'Becomes ruler of Egypt' },
      { book: 'Genesis', chapter: 50, verses: '15-21', note: 'Forgives his brothers' }
    ],
    keyLifeEvents: [
      'Received coat of many colors from Jacob',
      'Had prophetic dreams of leadership',
      'Sold into slavery by jealous brothers',
      'Falsely accused and imprisoned in Egypt',
      'Interpreted Pharaoh\'s dreams',
      'Became second-in-command of Egypt',
      'Saved Egypt and family from famine',
      'Forgave his brothers'
    ],
    relationships: [
      { characterId: 'jacob', type: 'parent', description: 'Father who favored him' },
      { characterId: 'rachel', type: 'parent', description: 'Mother' }
    ],
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // Old Testament - Leaders and Prophets
  {
    id: 'moses',
    name: 'Moses',
    altNames: [],
    summary: 'God\'s chosen leader who delivered Israel from Egyptian slavery and received the Ten Commandments. He led the Israelites through the wilderness for 40 years.',
    primaryPassages: [
      { book: 'Exodus', chapters: '2-40', note: 'Moses\' life and leadership' },
      { book: 'Exodus', chapter: 3, verses: '1-22', note: 'Burning bush call' },
      { book: 'Exodus', chapter: 20, verses: '1-17', note: 'Receives Ten Commandments' },
      { book: 'Deuteronomy', chapter: 34, verses: '1-12', note: 'Moses\' death' }
    ],
    keyLifeEvents: [
      'Born during Hebrew oppression in Egypt',
      'Adopted by Pharaoh\'s daughter',
      'Fled Egypt after killing Egyptian',
      'Called by God at burning bush',
      'Led Israelites out of Egypt',
      'Parted the Red Sea',
      'Received Law at Mount Sinai',
      'Led Israel through wilderness 40 years',
      'Died viewing Promised Land'
    ],
    relationships: [
      { characterId: 'aaron', type: 'sibling', description: 'Brother and first high priest' },
      { characterId: 'joshua', type: 'successor', description: 'Assistant and successor as leader' }
    ],
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'joshua',
    name: 'Joshua',
    altNames: [],
    summary: 'Moses\' successor who led Israel into the Promised Land. Known for his courage, faith, and military leadership in conquering Canaan.',
    primaryPassages: [
      { book: 'Joshua', chapters: '1-24', note: 'Joshua\'s leadership' },
      { book: 'Joshua', chapter: 1, verses: '1-9', note: 'God\'s commission' },
      { book: 'Joshua', chapter: 6, verses: '1-27', note: 'Fall of Jericho' },
      { book: 'Joshua', chapter: 24, verses: '14-15', note: 'Choose whom you will serve' }
    ],
    keyLifeEvents: [
      'Served as Moses\' assistant',
      'One of 12 spies who entered Canaan',
      'Gave faithful report with Caleb',
      'Chosen as Moses\' successor',
      'Led Israelites across Jordan River',
      'Conquered Jericho',
      'Defeated Canaanite kingdoms',
      'Divided land among tribes',
      'Challenged Israel to serve the Lord'
    ],
    relationships: [
      { characterId: 'moses', type: 'mentor', description: 'Mentor and predecessor' },
      { characterId: 'caleb', type: 'companion', description: 'Fellow faithful spy' }
    ],
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'david',
    name: 'David',
    altNames: [],
    summary: 'Israel\'s greatest king, a man after God\'s own heart. Shepherd, warrior, poet, and ancestor of Jesus Christ. Wrote many Psalms.',
    primaryPassages: [
      { book: '1 Samuel', chapter: 16, verses: '1-13', note: 'Anointed as king' },
      { book: '1 Samuel', chapter: 17, verses: '1-58', note: 'Defeats Goliath' },
      { book: '2 Samuel', chapters: '1-24', note: 'David\'s reign' },
      { book: '2 Samuel', chapter: 11, verses: '1-27', note: 'Sin with Bathsheba' },
      { book: 'Psalm', chapter: 23, verses: '1-6', note: 'The Lord is my shepherd' }
    ],
    keyLifeEvents: [
      'Youngest son of Jesse, shepherd',
      'Anointed by Samuel while young',
      'Defeated Goliath with sling',
      'Befriended Jonathan',
      'Fled from jealous King Saul',
      'Became king of Judah, then all Israel',
      'Brought ark to Jerusalem',
      'Committed adultery with Bathsheba',
      'Lost son in infancy as consequence',
      'United and expanded Israel\'s kingdom',
      'Established Jerusalem as capital'
    ],
    relationships: [
      { characterId: 'saul', type: 'predecessor', description: 'First king, later enemy' },
      { characterId: 'jonathan', type: 'friend', description: 'Saul\'s son, covenant friend' },
      { characterId: 'solomon', type: 'child', description: 'Son who succeeded him as king' }
    ],
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'solomon',
    name: 'Solomon',
    altNames: [],
    summary: 'Son of David, known for his wisdom, wealth, and building the first Temple in Jerusalem. Author of Proverbs, Ecclesiastes, and Song of Songs.',
    primaryPassages: [
      { book: '1 Kings', chapters: '1-11', note: 'Solomon\'s reign' },
      { book: '1 Kings', chapter: 3, verses: '5-14', note: 'Asks for wisdom' },
      { book: '1 Kings', chapters: '6-8', note: 'Builds the Temple' },
      { book: 'Proverbs', chapter: 1, verses: '1-7', note: 'Beginning of wisdom' }
    ],
    keyLifeEvents: [
      'Born to David and Bathsheba',
      'Chosen as David\'s successor',
      'Asked God for wisdom instead of wealth',
      'Demonstrated wisdom in famous judgment',
      'Built magnificent Temple in Jerusalem',
      'Accumulated great wealth and influence',
      'Married many foreign wives',
      'Turned from God in old age',
      'Kingdom divided after his death'
    ],
    relationships: [
      { characterId: 'david', type: 'parent', description: 'Father and predecessor' }
    ],
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'elijah',
    name: 'Elijah',
    altNames: [],
    summary: 'Powerful prophet who confronted idolatry in Israel. Called down fire from heaven and was taken to heaven in a whirlwind without dying.',
    primaryPassages: [
      { book: '1 Kings', chapters: '17-19', note: 'Elijah\'s ministry' },
      { book: '1 Kings', chapter: 18, verses: '16-46', note: 'Contest on Mount Carmel' },
      { book: '2 Kings', chapter: 2, verses: '1-18', note: 'Taken up to heaven' },
      { book: 'Malachi', chapter: 4, verses: '5-6', note: 'Prophecy of return' }
    ],
    keyLifeEvents: [
      'Proclaimed drought in Israel',
      'Fed by ravens during drought',
      'Raised widow\'s son from dead',
      'Confronted 450 prophets of Baal',
      'Called fire from heaven on Mount Carmel',
      'Fled from Jezebel\'s threats',
      'Heard God\'s still small voice',
      'Anointed Elisha as successor',
      'Taken to heaven in whirlwind'
    ],
    relationships: [
      { characterId: 'elisha', type: 'successor', description: 'Disciple and successor prophet' }
    ],
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'daniel',
    name: 'Daniel',
    altNames: [],
    summary: 'Jewish exile who served in Babylonian and Persian courts. Known for interpreting dreams and surviving the lions\' den while maintaining faithful devotion to God.',
    primaryPassages: [
      { book: 'Daniel', chapters: '1-12', note: 'Daniel\'s life and visions' },
      { book: 'Daniel', chapter: 1, verses: '1-21', note: 'Refuses royal food' },
      { book: 'Daniel', chapter: 6, verses: '1-28', note: 'Lions\' den' },
      { book: 'Daniel', chapters: '7-12', note: 'Prophetic visions' }
    ],
    keyLifeEvents: [
      'Taken captive to Babylon as youth',
      'Refused to defile himself with royal food',
      'Interpreted Nebuchadnezzar\'s dreams',
      'Interpreted writing on wall for Belshazzar',
      'Prayed despite decree forbidding it',
      'Thrown into lions\' den and survived',
      'Received visions of future kingdoms',
      'Served faithfully under multiple kings'
    ],
    relationships: [],
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // New Testament - John the Baptist and Jesus' family
  {
    id: 'john-baptist',
    name: 'John the Baptist',
    altNames: ['John', 'The Baptist'],
    summary: 'Prophet who prepared the way for Jesus Christ. Known for baptizing in the Jordan River and calling people to repentance. Baptized Jesus and identified Him as the Lamb of God.',
    primaryPassages: [
      { book: 'Matthew', chapter: 3, verses: '1-17', note: 'Ministry and baptism of Jesus' },
      { book: 'Luke', chapter: 1, verses: '5-25', note: 'Birth announced' },
      { book: 'John', chapter: 1, verses: '19-34', note: 'Testifies about Jesus' },
      { book: 'Matthew', chapter: 14, verses: '1-12', note: 'Death' }
    ],
    keyLifeEvents: [
      'Birth announced to Zechariah by angel',
      'Born to Elizabeth and Zechariah',
      'Lived in wilderness',
      'Preached repentance and baptism',
      'Baptized Jesus in Jordan River',
      'Declared Jesus the Lamb of God',
      'Confronted Herod about his sin',
      'Imprisoned by Herod',
      'Beheaded at Herodias\' request'
    ],
    relationships: [
      { characterId: 'jesus', type: 'cousin', description: 'Prepared the way for Jesus' }
    ],
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'mary-mother',
    name: 'Mary (Mother of Jesus)',
    altNames: ['Virgin Mary', 'Mary'],
    summary: 'Young virgin chosen by God to be the mother of Jesus Christ. Demonstrated remarkable faith and obedience in accepting God\'s plan.',
    primaryPassages: [
      { book: 'Luke', chapter: 1, verses: '26-56', note: 'Annunciation' },
      { book: 'Luke', chapter: 2, verses: '1-20', note: 'Birth of Jesus' },
      { book: 'John', chapter: 2, verses: '1-11', note: 'Wedding at Cana' },
      { book: 'John', chapter: 19, verses: '25-27', note: 'At the cross' }
    ],
    keyLifeEvents: [
      'Angel Gabriel announced she would bear Jesus',
      'Visited Elizabeth who confirmed prophecy',
      'Sang Magnificat praising God',
      'Traveled to Bethlehem with Joseph',
      'Gave birth to Jesus',
      'Presented Jesus at temple',
      'Fled to Egypt to protect Jesus',
      'Witnessed Jesus\' first miracle at Cana',
      'Present at Jesus\' crucifixion',
      'With disciples after resurrection'
    ],
    relationships: [
      { characterId: 'jesus', type: 'child', description: 'Son and Savior' },
      { characterId: 'joseph', type: 'spouse', description: 'Husband and protector' }
    ],
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'jesus',
    name: 'Jesus Christ',
    altNames: ['Jesus', 'Christ', 'Messiah', 'Son of God', 'Son of Man', 'The Word', 'Emmanuel'],
    summary: 'The Son of God and Savior of the world. Lived a sinless life, taught with authority, performed miracles, died on the cross for humanity\'s sins, and rose from the dead on the third day.',
    primaryPassages: [
      { book: 'Matthew', chapters: '1-28', note: 'Gospel of Matthew' },
      { book: 'Mark', chapters: '1-16', note: 'Gospel of Mark' },
      { book: 'Luke', chapters: '1-24', note: 'Gospel of Luke' },
      { book: 'John', chapters: '1-21', note: 'Gospel of John' },
      { book: 'John', chapter: 3, verse: '16', note: 'God so loved the world' },
      { book: 'Matthew', chapters: '5-7', note: 'Sermon on the Mount' }
    ],
    keyLifeEvents: [
      'Born in Bethlehem to Virgin Mary',
      'Visited by shepherds and wise men',
      'Presented at temple',
      'Family fled to Egypt',
      'Taught in temple at age 12',
      'Baptized by John the Baptist',
      'Tempted by Satan in wilderness',
      'Called 12 disciples',
      'Performed many miracles',
      'Taught throughout Galilee and Judea',
      'Transfigured on mountain',
      'Triumphal entry into Jerusalem',
      'Last Supper with disciples',
      'Arrested and tried',
      'Crucified at Golgotha',
      'Rose from dead on third day',
      'Appeared to disciples',
      'Ascended to heaven'
    ],
    relationships: [
      { characterId: 'mary-mother', type: 'parent', description: 'Mother' },
      { characterId: 'joseph', type: 'parent', description: 'Earthly father' },
      { characterId: 'john-baptist', type: 'cousin', description: 'Forerunner who baptized Him' },
      { characterId: 'peter', type: 'disciple', description: 'Lead apostle' },
      { characterId: 'john-apostle', type: 'disciple', description: 'Beloved disciple' }
    ],
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // New Testament - Disciples/Apostles
  {
    id: 'peter',
    name: 'Peter',
    altNames: ['Simon Peter', 'Simon', 'Cephas'],
    summary: 'Fisherman who became one of Jesus\' closest disciples and a leader of the early church. Known for his boldness, his denial of Jesus, and his restoration and powerful preaching.',
    primaryPassages: [
      { book: 'Matthew', chapter: 16, verses: '13-20', note: 'Confession of Christ' },
      { book: 'Matthew', chapter: 26, verses: '69-75', note: 'Denies Jesus' },
      { book: 'John', chapter: 21, verses: '15-19', note: 'Restored by Jesus' },
      { book: 'Acts', chapter: 2, verses: '14-41', note: 'Pentecost sermon' }
    ],
    keyLifeEvents: [
      'Fisherman called by Jesus',
      'Walked on water toward Jesus',
      'Confessed Jesus as the Christ',
      'Witnessed transfiguration',
      'Cut off soldier\'s ear at arrest',
      'Denied Jesus three times',
      'Wept bitterly in repentance',
      'First to see empty tomb',
      'Restored by Jesus after resurrection',
      'Preached at Pentecost',
      'Led early Jerusalem church',
      'Vision led to accepting Gentiles'
    ],
    relationships: [
      { characterId: 'jesus', type: 'master', description: 'Lord and Savior' },
      { characterId: 'john-apostle', type: 'companion', description: 'Fellow apostle and friend' },
      { characterId: 'paul', type: 'colleague', description: 'Fellow apostle' }
    ],
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'john-apostle',
    name: 'John (Apostle)',
    altNames: ['John', 'Son of Thunder', 'Beloved Disciple'],
    summary: 'One of Jesus\' closest disciples, author of the Gospel of John, three epistles, and Revelation. Known as the disciple whom Jesus loved.',
    primaryPassages: [
      { book: 'John', chapters: '1-21', note: 'Gospel he wrote' },
      { book: '1 John', chapters: '1-5', note: 'First epistle' },
      { book: 'Revelation', chapters: '1-22', note: 'Apocalyptic vision' },
      { book: 'John', chapter: 13, verse: '23', note: 'Leaned on Jesus\' bosom' }
    ],
    keyLifeEvents: [
      'Fisherman with brother James',
      'Called by Jesus with brother',
      'Part of Jesus\' inner circle',
      'Witnessed transfiguration',
      'Present at Last Supper',
      'Stood at foot of cross',
      'Given care of Jesus\' mother',
      'First to believe at empty tomb',
      'Led early church with Peter',
      'Exiled to Patmos',
      'Received Revelation vision',
      'Wrote Gospel and epistles'
    ],
    relationships: [
      { characterId: 'jesus', type: 'master', description: 'Lord and closest friend' },
      { characterId: 'peter', type: 'companion', description: 'Fellow apostle' },
      { characterId: 'james-apostle', type: 'sibling', description: 'Brother, also apostle' }
    ],
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'paul',
    name: 'Paul',
    altNames: ['Saul of Tarsus', 'Saul'],
    summary: 'Persecutor of Christians transformed by encounter with Jesus on Damascus road. Became greatest missionary and theologian of early church. Wrote much of the New Testament.',
    primaryPassages: [
      { book: 'Acts', chapter: 9, verses: '1-31', note: 'Conversion on Damascus road' },
      { book: 'Acts', chapters: '13-28', note: 'Missionary journeys' },
      { book: 'Romans', chapters: '1-16', note: 'Epistle to Romans' },
      { book: 'Philippians', chapter: 3, verses: '4-14', note: 'Paul\'s testimony' }
    ],
    keyLifeEvents: [
      'Born in Tarsus, Roman citizen',
      'Educated under Gamaliel',
      'Persecuted early Christians',
      'Witnessed Stephen\'s martyrdom',
      'Encountered Jesus on Damascus road',
      'Blinded, then healed by Ananias',
      'Preached Christ in Damascus',
      'Three missionary journeys',
      'Wrote 13+ New Testament letters',
      'Arrested in Jerusalem',
      'Appealed to Caesar',
      'Shipwrecked on way to Rome',
      'House arrest in Rome',
      'Martyred in Rome'
    ],
    relationships: [
      { characterId: 'peter', type: 'colleague', description: 'Fellow apostle' }
    ],
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // Old Testament - Women
  {
    id: 'ruth',
    name: 'Ruth',
    altNames: [],
    summary: 'Moabite widow who showed remarkable loyalty to her mother-in-law Naomi and the God of Israel. Became great-grandmother of King David and ancestor of Jesus.',
    primaryPassages: [
      { book: 'Ruth', chapters: '1-4', note: 'Book of Ruth' },
      { book: 'Ruth', chapter: 1, verses: '16-17', note: 'Pledge of loyalty' },
      { book: 'Matthew', chapter: 1, verse: '5', note: 'In Jesus\' genealogy' }
    ],
    keyLifeEvents: [
      'Married into Israelite family in Moab',
      'Widowed young',
      'Chose to stay with Naomi',
      'Traveled to Bethlehem',
      'Gleaned in Boaz\'s field',
      'Proposed to Boaz',
      'Married Boaz as kinsman-redeemer',
      'Gave birth to Obed',
      'Became ancestor of David and Jesus'
    ],
    relationships: [],
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'esther',
    name: 'Esther',
    altNames: ['Hadassah'],
    summary: 'Jewish queen of Persia who risked her life to save her people from genocide. Demonstrated courage and wisdom in approaching the king.',
    primaryPassages: [
      { book: 'Esther', chapters: '1-10', note: 'Book of Esther' },
      { book: 'Esther', chapter: 4, verse: '14', note: 'For such a time as this' },
      { book: 'Esther', chapter: 4, verse: '16', note: 'If I perish, I perish' }
    ],
    keyLifeEvents: [
      'Orphaned, raised by Mordecai',
      'Chosen as queen of Persia',
      'Kept Jewish identity secret',
      'Learned of Haman\'s plot',
      'Fasted three days',
      'Approached king uninvited',
      'Revealed plot to king',
      'Saved Jewish people',
      'Established Purim feast'
    ],
    relationships: [],
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // New Testament - Other key figures
  {
    id: 'mary-magdalene',
    name: 'Mary Magdalene',
    altNames: ['Mary of Magdala'],
    summary: 'Devoted follower of Jesus from whom He cast out seven demons. First witness to the resurrection. Often unfairly conflated with other women in the gospels.',
    primaryPassages: [
      { book: 'Luke', chapter: 8, verses: '1-3', note: 'Among Jesus\' followers' },
      { book: 'John', chapter: 20, verses: '1-18', note: 'First to see risen Jesus' },
      { book: 'Mark', chapter: 16, verses: '9-11', note: 'Jesus appears to her' }
    ],
    keyLifeEvents: [
      'Jesus cast seven demons from her',
      'Supported Jesus\' ministry financially',
      'Followed Jesus to the cross',
      'Present at crucifixion',
      'Witnessed burial',
      'First to visit empty tomb',
      'First to see risen Jesus',
      'Told disciples of resurrection'
    ],
    relationships: [
      { characterId: 'jesus', type: 'master', description: 'Lord and Savior' }
    ],
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

/**
 * Get character by ID
 */
export const getCharacterById = (id) => {
  return biblicalCharacters.find(char => char.id === id);
};

/**
 * Search characters by name
 */
export const searchCharacters = (query) => {
  if (!query) return biblicalCharacters;

  const lowerQuery = query.toLowerCase();
  return biblicalCharacters.filter(char =>
    char.name.toLowerCase().includes(lowerQuery) ||
    char.altNames.some(alt => alt.toLowerCase().includes(lowerQuery))
  );
};

/**
 * Get characters sorted alphabetically
 */
export const getCharactersSorted = () => {
  return [...biblicalCharacters].sort((a, b) =>
    a.name.localeCompare(b.name)
  );
};

/**
 * Get characters grouped by first letter
 */
export const getCharactersGroupedByLetter = () => {
  const sorted = getCharactersSorted();
  const grouped = {};

  sorted.forEach(char => {
    const firstLetter = char.name[0].toUpperCase();
    if (!grouped[firstLetter]) {
      grouped[firstLetter] = [];
    }
    grouped[firstLetter].push(char);
  });

  return grouped;
};

export default biblicalCharacters;
