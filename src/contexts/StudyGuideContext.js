import React, { createContext, useContext, useState, useEffect } from 'react';

const StudyGuideContext = createContext();

export const useStudyGuides = () => {
  const context = useContext(StudyGuideContext);
  if (!context) {
    throw new Error('useStudyGuides must be used within a StudyGuideProvider');
  }
  return context;
};

export const StudyGuideProvider = ({ children }) => {
  const [studyGuides, setStudyGuides] = useState({});
  const [loading, setLoading] = useState(true);

  // Load study guides from localStorage on mount
  useEffect(() => {
    const storedGuides = localStorage.getItem('sunday-school-study-guides');
    if (storedGuides) {
      try {
        setStudyGuides(JSON.parse(storedGuides));
      } catch (error) {
        console.error('Error loading study guides:', error);
        loadDefaultStudyGuides();
      }
    } else {
      // Load default study guides if none exist
      loadDefaultStudyGuides();
    }
    setLoading(false);
  }, []);

  // Save study guides to localStorage whenever they change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('sunday-school-study-guides', JSON.stringify(studyGuides));
    }
  }, [studyGuides, loading]);

  const loadDefaultStudyGuides = () => {
    const defaultGuides = {
      // Old Testament
      GEN: {
        bookId: 'GEN',
        bookName: 'Genesis',
        author: 'Moses',
        dateWritten: 'c. 1445-1405 BC',
        audience: 'The people of Israel',
        summary: 'Genesis, meaning "beginning," records the creation of the world, the fall of humanity into sin, and God\'s plan of redemption through Abraham and his descendants. It establishes foundational truths about God, humanity, sin, and salvation.',
        themes: [
          'God as Creator and Sustainer',
          'The origin and nature of sin',
          'God\'s covenant promises',
          'Faith and obedience',
          'God\'s sovereignty in human history'
        ],
        outline: [
          { section: 'Primeval History (1-11)', points: ['Creation (1-2)', 'The Fall (3)', 'Cain and Abel (4)', 'Noah and the Flood (6-9)', 'Tower of Babel (11)'] },
          { section: 'Patriarchal History (12-50)', points: ['Abraham (12-25)', 'Isaac (26-27)', 'Jacob (28-36)', 'Joseph (37-50)'] }
        ],
        historicalContext: 'Written during or shortly after the Exodus from Egypt, Genesis provided the Israelites with their foundational history and identity as God\'s chosen people. It answered key questions about origins, purpose, and their relationship with God.',
        keyVerses: [
          { reference: 'Genesis 1:1', text: 'In the beginning God created the heavens and the earth.' },
          { reference: 'Genesis 12:2-3', text: 'God\'s promise to Abraham to bless all nations through him.' }
        ],
        version: 1,
        updatedAt: new Date().toISOString()
      },
      EXO: {
        bookId: 'EXO',
        bookName: 'Exodus',
        author: 'Moses',
        dateWritten: 'c. 1445-1405 BC',
        audience: 'The people of Israel',
        summary: 'Exodus means "departure" and tells the story of God delivering Israel from Egyptian slavery and establishing them as His covenant nation. It reveals God\'s character through His mighty acts of redemption and His giving of the Law at Mount Sinai.',
        themes: [
          'Redemption and deliverance',
          'God\'s faithfulness to His covenant',
          'The holiness of God',
          'Worship and the tabernacle',
          'Law and obedience'
        ],
        outline: [
          { section: 'Israel in Egypt (1-12)', points: ['Oppression in Egypt (1)', 'Moses\' birth and calling (2-4)', 'Confrontation with Pharaoh (5-11)', 'The Passover (12)'] },
          { section: 'Journey to Sinai (13-18)', points: ['Red Sea crossing (13-14)', 'Wilderness provision (15-17)'] },
          { section: 'The Covenant at Sinai (19-24)', points: ['The Ten Commandments (20)', 'The Book of the Covenant (21-23)'] },
          { section: 'The Tabernacle (25-40)', points: ['Instructions for the tabernacle (25-31)', 'The golden calf (32-34)', 'Building the tabernacle (35-40)'] }
        ],
        historicalContext: 'The exodus occurred around 1446 BC, a pivotal event in Israel\'s history. Egypt was a major world power, making God\'s deliverance all the more miraculous. The giving of the Law established Israel as a theocracy with God as their king.',
        keyVerses: [
          { reference: 'Exodus 3:14', text: 'God said to Moses, "I AM WHO I AM."' },
          { reference: 'Exodus 20:2-3', text: 'The first commandment: "I am the LORD your God... You shall have no other gods before me."' }
        ],
        version: 1,
        updatedAt: new Date().toISOString()
      },
      PSA: {
        bookId: 'PSA',
        bookName: 'Psalms',
        author: 'Multiple authors (David, Asaph, Sons of Korah, Moses, Solomon, and others)',
        dateWritten: 'c. 1410-450 BC (compiled over 1000 years)',
        audience: 'The worshiping community of Israel',
        summary: 'The Psalms are the prayer book and hymnal of ancient Israel, expressing the full range of human emotion in relationship with God. They teach us how to worship, pray, lament, give thanks, and trust in God through all circumstances.',
        themes: [
          'Worship and praise of God',
          'Honest prayer and lament',
          'God\'s faithfulness and steadfast love',
          'The righteous vs. the wicked',
          'Messianic prophecy',
          'Trust in God\'s sovereignty'
        ],
        outline: [
          { section: 'Book I (1-41)', points: ['Primarily psalms of David', 'Focus on humanity and creation'] },
          { section: 'Book II (42-72)', points: ['Psalms of David, Korah, and Asaph', 'Focus on Israel as a nation'] },
          { section: 'Book III (73-89)', points: ['Psalms of Asaph and others', 'Focus on the sanctuary'] },
          { section: 'Book IV (90-106)', points: ['Anonymous psalms', 'Focus on God as eternal King'] },
          { section: 'Book V (107-150)', points: ['Psalms of praise and thanksgiving', 'Focus on God\'s Word and worship'] }
        ],
        historicalContext: 'The Psalms span Israel\'s history from the time of Moses to after the Babylonian exile. They were used in temple worship and private devotion, shaping Israel\'s spiritual life and identity.',
        keyVerses: [
          { reference: 'Psalm 1:1-2', text: 'Blessed is the one who meditates on God\'s law day and night.' },
          { reference: 'Psalm 23:1', text: 'The LORD is my shepherd, I lack nothing.' }
        ],
        version: 1,
        updatedAt: new Date().toISOString()
      },
      PRO: {
        bookId: 'PRO',
        bookName: 'Proverbs',
        author: 'Solomon (primarily), with contributions from Agur and Lemuel',
        dateWritten: 'c. 950-700 BC',
        audience: 'Young people and all who seek wisdom',
        summary: 'Proverbs is a collection of wise sayings and instructions for living skillfully in God\'s world. It teaches practical wisdom for daily life, based on the fear of the Lord as the foundation of all knowledge.',
        themes: [
          'The fear of the Lord as the beginning of wisdom',
          'Moral character and integrity',
          'The power of words',
          'Diligence vs. laziness',
          'Relationships and sexuality',
          'Wealth and poverty'
        ],
        outline: [
          { section: 'Introduction (1:1-7)', points: ['Purpose and theme'] },
          { section: 'Wisdom\'s Call (1:8-9:18)', points: ['Instructions from father to son', 'Personification of wisdom'] },
          { section: 'Proverbs of Solomon (10-22:16)', points: ['Short, pithy sayings'] },
          { section: 'Sayings of the Wise (22:17-24:34)', points: ['Longer instructions'] },
          { section: 'More Proverbs of Solomon (25-29)', points: ['Collected by Hezekiah\'s men'] },
          { section: 'Words of Agur and Lemuel (30-31)', points: ['Numerical proverbs', 'The excellent wife'] }
        ],
        historicalContext: 'Written during Israel\'s united monarchy and later compiled during Hezekiah\'s reign. Wisdom literature was common in the ancient Near East, but Proverbs is unique in grounding wisdom in reverence for the one true God.',
        keyVerses: [
          { reference: 'Proverbs 1:7', text: 'The fear of the LORD is the beginning of knowledge.' },
          { reference: 'Proverbs 3:5-6', text: 'Trust in the LORD with all your heart and lean not on your own understanding.' }
        ],
        version: 1,
        updatedAt: new Date().toISOString()
      },
      ISA: {
        bookId: 'ISA',
        bookName: 'Isaiah',
        author: 'Isaiah',
        dateWritten: 'c. 740-680 BC',
        audience: 'The kingdom of Judah and Jerusalem',
        summary: 'Isaiah prophesied during a critical time in Judah\'s history, warning of coming judgment while also promising future salvation through the Messiah. The book beautifully balances God\'s holiness and justice with His mercy and grace.',
        themes: [
          'The holiness of God',
          'Judgment on sin and rebellion',
          'The coming Messiah and His kingdom',
          'Comfort and restoration',
          'God\'s sovereignty over all nations',
          'The Suffering Servant'
        ],
        outline: [
          { section: 'Prophecies of Judgment (1-39)', points: ['Judgment on Judah (1-12)', 'Judgment on nations (13-23)', 'The apocalypse of Isaiah (24-27)', 'Woe and deliverance (28-35)', 'Historical interlude (36-39)'] },
          { section: 'Prophecies of Comfort (40-66)', points: ['Deliverance and return (40-48)', 'The Suffering Servant (49-57)', 'Future glory and restoration (58-66)'] }
        ],
        historicalContext: 'Isaiah ministered during the reigns of four kings of Judah (Uzziah, Jotham, Ahaz, Hezekiah). This was a time of political upheaval with the Assyrian threat looming. The northern kingdom of Israel fell during his ministry.',
        keyVerses: [
          { reference: 'Isaiah 6:3', text: 'Holy, holy, holy is the LORD Almighty; the whole earth is full of his glory.' },
          { reference: 'Isaiah 53:5', text: 'He was pierced for our transgressions, he was crushed for our iniquities.' }
        ],
        version: 1,
        updatedAt: new Date().toISOString()
      },
      // New Testament
      MAT: {
        bookId: 'MAT',
        bookName: 'Matthew',
        author: 'Matthew (Levi), the tax collector and apostle',
        dateWritten: 'c. AD 50-70',
        audience: 'Jewish Christians',
        summary: 'Matthew presents Jesus as the promised Messiah and King of the Jews, showing how He fulfills Old Testament prophecies. The Gospel emphasizes Jesus\' teachings and demonstrates that the kingdom of God has come in Jesus Christ.',
        themes: [
          'Jesus as the promised Messiah',
          'The kingdom of heaven/God',
          'Fulfillment of Old Testament prophecy',
          'Jesus as teacher and lawgiver',
          'The new community of disciples',
          'Judgment and salvation'
        ],
        outline: [
          { section: 'Birth and Preparation (1-4)', points: ['Genealogy and birth (1-2)', 'John the Baptist and baptism (3)', 'Temptation in wilderness (4)'] },
          { section: 'Ministry in Galilee (5-18)', points: ['Sermon on the Mount (5-7)', 'Miracles and teachings (8-18)'] },
          { section: 'Journey to Jerusalem (19-20)', points: ['Teachings on discipleship'] },
          { section: 'Final Week in Jerusalem (21-28)', points: ['Triumphal entry (21)', 'Olivet Discourse (24-25)', 'Passion and resurrection (26-28)'] }
        ],
        historicalContext: 'Written to Jewish Christians who were trying to understand how Jesus fit into God\'s plan for Israel. The Gospel bridges the Old and New Testaments, showing continuity in God\'s redemptive plan.',
        keyVerses: [
          { reference: 'Matthew 1:21', text: 'You are to give him the name Jesus, because he will save his people from their sins.' },
          { reference: 'Matthew 28:18-20', text: 'The Great Commission: Go and make disciples of all nations.' }
        ],
        version: 1,
        updatedAt: new Date().toISOString()
      },
      MRK: {
        bookId: 'MRK',
        bookName: 'Mark',
        author: 'John Mark, companion of Peter',
        dateWritten: 'c. AD 50-60',
        audience: 'Roman (Gentile) Christians',
        summary: 'Mark presents Jesus as the suffering Servant and Son of God, emphasizing His actions more than His teachings. The Gospel moves quickly from one event to another, showing Jesus\' power and authority, culminating in His sacrificial death and resurrection.',
        themes: [
          'Jesus as the Servant of God',
          'The cost of discipleship',
          'Jesus\' authority and power',
          'Suffering and service',
          'The kingdom of God',
          'Faith and understanding'
        ],
        outline: [
          { section: 'Preparation for Ministry (1:1-13)', points: ['John the Baptist', 'Baptism and temptation'] },
          { section: 'Ministry in Galilee (1:14-8:26)', points: ['Calling disciples', 'Miracles and teachings', 'Growing opposition'] },
          { section: 'Journey to Jerusalem (8:27-10:52)', points: ['Peter\'s confession', 'Transfiguration', 'Passion predictions'] },
          { section: 'Final Week and Resurrection (11-16)', points: ['Triumphal entry', 'Temple teachings', 'Passion and resurrection'] }
        ],
        historicalContext: 'Written primarily for Roman Christians during a time of persecution (possibly under Nero). Mark emphasizes Jesus\' suffering to encourage believers facing their own trials. The Gospel reflects Peter\'s eyewitness testimony.',
        keyVerses: [
          { reference: 'Mark 10:45', text: 'The Son of Man did not come to be served, but to serve, and to give his life as a ransom for many.' },
          { reference: 'Mark 1:15', text: 'The kingdom of God has come near. Repent and believe the good news!' }
        ],
        version: 1,
        updatedAt: new Date().toISOString()
      },
      LUK: {
        bookId: 'LUK',
        bookName: 'Luke',
        author: 'Luke, the physician and companion of Paul',
        dateWritten: 'c. AD 60-62',
        audience: 'Theophilus (a Gentile believer) and Gentile Christians',
        summary: 'Luke presents Jesus as the perfect Son of Man who came to seek and save the lost. Written with careful historical detail, Luke emphasizes Jesus\' compassion for the marginalized, His prayer life, and the universal scope of salvation.',
        themes: [
          'Jesus as Savior of all people',
          'Compassion for the poor and outcasts',
          'The role of the Holy Spirit',
          'Prayer and dependence on God',
          'Joy and celebration',
          'Women in Jesus\' ministry'
        ],
        outline: [
          { section: 'Prologue and Birth Narratives (1-2)', points: ['Announcements and births of John and Jesus'] },
          { section: 'Preparation and Early Ministry (3-9:50)', points: ['Baptism and genealogy', 'Ministry in Galilee', 'Choosing the Twelve'] },
          { section: 'Journey to Jerusalem (9:51-19:27)', points: ['Unique teachings and parables'] },
          { section: 'Final Week and Resurrection (19:28-24)', points: ['Triumphal entry', 'Passion narratives', 'Resurrection and ascension'] }
        ],
        historicalContext: 'Written as part one of a two-volume work (Luke-Acts) to provide an orderly account of Jesus\' life and the early church. Luke conducted careful research, interviewing eyewitnesses to present an accurate historical record.',
        keyVerses: [
          { reference: 'Luke 19:10', text: 'The Son of Man came to seek and to save the lost.' },
          { reference: 'Luke 2:10-11', text: 'I bring you good news that will cause great joy for all the people.' }
        ],
        version: 1,
        updatedAt: new Date().toISOString()
      },
      JHN: {
        bookId: 'JHN',
        bookName: 'John',
        author: 'John, the apostle and son of Zebedee',
        dateWritten: 'c. AD 85-95',
        audience: 'Both Jewish and Gentile Christians, particularly in Asia Minor',
        summary: 'John presents Jesus as the divine Son of God, emphasizing His deity and eternal nature. The Gospel is highly theological, focused on seven miraculous signs and extended discourses that reveal Jesus\' identity and mission.',
        themes: [
          'Jesus as the Son of God',
          'Eternal life through faith in Jesus',
          'Light vs. darkness',
          'Belief and unbelief',
          'The "I AM" statements of Jesus',
          'Love and relationship with God'
        ],
        outline: [
          { section: 'Prologue (1:1-18)', points: ['The Word became flesh'] },
          { section: 'Book of Signs (1:19-12)', points: ['Seven miraculous signs', 'Public ministry and teachings', 'Growing opposition'] },
          { section: 'Book of Glory (13-20)', points: ['Upper room discourse (13-17)', 'Passion and resurrection (18-20)'] },
          { section: 'Epilogue (21)', points: ['Appearance at Sea of Galilee', 'Restoration of Peter'] }
        ],
        historicalContext: 'Written late in the first century when the church faced false teachings about Jesus\' nature. John wrote to firmly establish Jesus\' deity while also emphasizing His genuine humanity. The Gospel supplements the synoptic Gospels with unique material.',
        keyVerses: [
          { reference: 'John 1:1', text: 'In the beginning was the Word, and the Word was with God, and the Word was God.' },
          { reference: 'John 3:16', text: 'For God so loved the world that he gave his one and only Son.' },
          { reference: 'John 20:31', text: 'These are written that you may believe that Jesus is the Messiah, the Son of God.' }
        ],
        version: 1,
        updatedAt: new Date().toISOString()
      },
      ACT: {
        bookId: 'ACT',
        bookName: 'Acts',
        author: 'Luke',
        dateWritten: 'c. AD 62-63',
        audience: 'Theophilus and Gentile Christians',
        summary: 'Acts is the sequel to Luke\'s Gospel, chronicling the birth and growth of the early church through the power of the Holy Spirit. It traces the spread of the gospel from Jerusalem to Rome, focusing on Peter and Paul\'s ministries.',
        themes: [
          'The power of the Holy Spirit',
          'The growth of the church',
          'Witness and evangelism',
          'God\'s inclusion of the Gentiles',
          'Persecution and faithfulness',
          'The sovereignty of God in mission'
        ],
        outline: [
          { section: 'The Church in Jerusalem (1-7)', points: ['Ascension and Pentecost (1-2)', 'Early church life (3-7)'] },
          { section: 'Expansion to Judea and Samaria (8-12)', points: ['Stephen\'s martyrdom', 'Philip\'s ministry', 'Paul\'s conversion', 'Peter and Cornelius'] },
          { section: 'Paul\'s Missionary Journeys (13-21)', points: ['First journey (13-14)', 'Jerusalem Council (15)', 'Second journey (16-18)', 'Third journey (19-21)'] },
          { section: 'Paul\'s Journey to Rome (22-28)', points: ['Arrest and trials', 'Voyage and shipwreck', 'Ministry in Rome'] }
        ],
        historicalContext: 'Written during Paul\'s imprisonment in Rome, Acts documents the first 30 years of church history (c. AD 30-62). It shows how the gospel spread from a Jewish sect in Jerusalem to a worldwide movement reaching the Roman capital.',
        keyVerses: [
          { reference: 'Acts 1:8', text: 'You will receive power when the Holy Spirit comes on you; and you will be my witnesses.' },
          { reference: 'Acts 2:38', text: 'Repent and be baptized, every one of you, in the name of Jesus Christ for the forgiveness of your sins.' }
        ],
        version: 1,
        updatedAt: new Date().toISOString()
      },
      ROM: {
        bookId: 'ROM',
        bookName: 'Romans',
        author: 'Paul the apostle',
        dateWritten: 'c. AD 57',
        audience: 'The church in Rome, both Jewish and Gentile believers',
        summary: 'Romans is Paul\'s most systematic presentation of the gospel, explaining how God\'s righteousness is revealed through faith in Jesus Christ. It addresses the universal problem of sin and God\'s solution through justification by faith.',
        themes: [
          'Justification by faith alone',
          'The righteousness of God',
          'Universal sinfulness of humanity',
          'Grace vs. law',
          'Sanctification and the Christian life',
          'God\'s sovereignty and plan for Israel',
          'Christian living and relationships'
        ],
        outline: [
          { section: 'Introduction (1:1-17)', points: ['Greeting and theme'] },
          { section: 'Sin and Justification (1:18-5)', points: ['Universal condemnation (1:18-3:20)', 'Justification by faith (3:21-5:21)'] },
          { section: 'Sanctification (6-8)', points: ['Freedom from sin (6)', 'Freedom from law (7)', 'Life in the Spirit (8)'] },
          { section: 'Israel\'s Role (9-11)', points: ['God\'s sovereignty', 'Israel\'s rejection and future'] },
          { section: 'Christian Living (12-15)', points: ['Transformed living', 'Love and relationships'] },
          { section: 'Conclusion (16)', points: ['Personal greetings'] }
        ],
        historicalContext: 'Written from Corinth before Paul\'s first visit to Rome. The Roman church consisted of both Jewish and Gentile believers, and tensions existed between these groups. Paul wrote to prepare for his visit and to present the gospel comprehensively.',
        keyVerses: [
          { reference: 'Romans 1:16-17', text: 'I am not ashamed of the gospel... the righteous will live by faith.' },
          { reference: 'Romans 3:23-24', text: 'All have sinned and fall short... justified freely by his grace.' },
          { reference: 'Romans 8:1', text: 'There is now no condemnation for those who are in Christ Jesus.' }
        ],
        version: 1,
        updatedAt: new Date().toISOString()
      },
      '1CO': {
        bookId: '1CO',
        bookName: '1 Corinthians',
        author: 'Paul the apostle',
        dateWritten: 'c. AD 55',
        audience: 'The church in Corinth',
        summary: '1 Corinthians addresses various problems and questions in the Corinthian church, including divisions, immorality, lawsuits, and confusion about spiritual gifts. Paul calls believers to unity in Christ and proper conduct that honors God.',
        themes: [
          'Unity in the church',
          'True wisdom vs. worldly wisdom',
          'Sexual purity',
          'Christian freedom and responsibility',
          'Worship and spiritual gifts',
          'The resurrection of Christ and believers',
          'Love as the greatest virtue'
        ],
        outline: [
          { section: 'Introduction (1:1-9)', points: ['Greeting and thanksgiving'] },
          { section: 'Divisions in the Church (1:10-4)', points: ['Factions and true wisdom'] },
          { section: 'Moral and Ethical Issues (5-6)', points: ['Immorality and lawsuits'] },
          { section: 'Marriage and Singleness (7)', points: ['Principles for relationships'] },
          { section: 'Christian Freedom (8-11:1)', points: ['Food sacrificed to idols'] },
          { section: 'Worship Practices (11:2-14)', points: ['Head coverings', 'Lord\'s Supper', 'Spiritual gifts'] },
          { section: 'The Resurrection (15)', points: ['Christ\'s resurrection', 'Our resurrection'] },
          { section: 'Conclusion (16)', points: ['Collection and greetings'] }
        ],
        historicalContext: 'Corinth was a wealthy, cosmopolitan port city known for immorality and religious diversity. The church struggled with worldliness and divisions. Paul had founded the church during his second missionary journey and wrote this letter from Ephesus.',
        keyVerses: [
          { reference: '1 Corinthians 1:18', text: 'The message of the cross is foolishness to those who are perishing, but to us who are being saved it is the power of God.' },
          { reference: '1 Corinthians 13:13', text: 'And now these three remain: faith, hope and love. But the greatest of these is love.' },
          { reference: '1 Corinthians 15:3-4', text: 'Christ died for our sins... was buried... was raised on the third day.' }
        ],
        version: 1,
        updatedAt: new Date().toISOString()
      },
      GAL: {
        bookId: 'GAL',
        bookName: 'Galatians',
        author: 'Paul the apostle',
        dateWritten: 'c. AD 49-55',
        audience: 'The churches in Galatia',
        summary: 'Galatians is Paul\'s passionate defense of the gospel of grace against those teaching that Gentile believers must follow Jewish law. It emphasizes that salvation comes through faith in Christ alone, not by works of the law.',
        themes: [
          'Justification by faith alone',
          'Freedom in Christ',
          'The sufficiency of the gospel',
          'Law vs. grace',
          'Life by the Spirit',
          'The fruit of the Spirit'
        ],
        outline: [
          { section: 'Introduction (1:1-10)', points: ['Greeting and rebuke'] },
          { section: 'Paul\'s Gospel and Authority (1:11-2)', points: ['Paul\'s conversion', 'Confrontation with Peter'] },
          { section: 'Justification by Faith (3-4)', points: ['Abraham\'s faith', 'Purpose of the law', 'Adoption as sons'] },
          { section: 'Freedom in Christ (5-6)', points: ['Freedom vs. bondage', 'Fruit of the Spirit', 'Practical exhortations'] }
        ],
        historicalContext: 'False teachers (Judaizers) were telling Gentile Christians they needed to be circumcised and follow Jewish law to be saved. Paul wrote urgently to combat this distortion of the gospel and reaffirm salvation by grace through faith.',
        keyVerses: [
          { reference: 'Galatians 2:20', text: 'I have been crucified with Christ and I no longer live, but Christ lives in me.' },
          { reference: 'Galatians 3:28', text: 'There is neither Jew nor Gentile... for you are all one in Christ Jesus.' },
          { reference: 'Galatians 5:22-23', text: 'The fruit of the Spirit is love, joy, peace, patience, kindness, goodness, faithfulness, gentleness and self-control.' }
        ],
        version: 1,
        updatedAt: new Date().toISOString()
      },
      EPH: {
        bookId: 'EPH',
        bookName: 'Ephesians',
        author: 'Paul the apostle',
        dateWritten: 'c. AD 60-62',
        audience: 'The church in Ephesus and surrounding churches',
        summary: 'Ephesians unveils God\'s eternal plan to unite all things in Christ and describes the church as the body of Christ. It emphasizes believers\' spiritual blessings in Christ and provides practical guidance for living out their new identity.',
        themes: [
          'Spiritual blessings in Christ',
          'Unity of the church',
          'God\'s eternal purpose',
          'Grace and salvation',
          'The new life in Christ',
          'Spiritual warfare'
        ],
        outline: [
          { section: 'Doctrine: Our Position in Christ (1-3)', points: ['Spiritual blessings (1)', 'Saved by grace (2)', 'Mystery of the church (3)'] },
          { section: 'Practice: Our Walk in Christ (4-6)', points: ['Unity and gifts (4)', 'Living in love and light (5)', 'Spiritual armor (6)'] }
        ],
        historicalContext: 'Written during Paul\'s Roman imprisonment. Ephesus was a major city where Paul had ministered for three years. This letter was likely circular, read in multiple churches in Asia Minor, emphasizing the universal church.',
        keyVerses: [
          { reference: 'Ephesians 2:8-9', text: 'For it is by grace you have been saved, through faith—and this is not from yourselves, it is the gift of God.' },
          { reference: 'Ephesians 4:4-6', text: 'There is one body and one Spirit... one Lord, one faith, one baptism; one God and Father of all.' }
        ],
        version: 1,
        updatedAt: new Date().toISOString()
      },
      PHP: {
        bookId: 'PHP',
        bookName: 'Philippians',
        author: 'Paul the apostle',
        dateWritten: 'c. AD 61-62',
        audience: 'The church in Philippi',
        summary: 'Philippians is Paul\'s joyful letter from prison, encouraging believers to rejoice in Christ regardless of circumstances. It emphasizes Christ\'s humility as a model for believers and the surpassing worth of knowing Christ.',
        themes: [
          'Joy in all circumstances',
          'Partnership in the gospel',
          'Christ\'s humility and exaltation',
          'Unity and humility in the church',
          'Righteousness through faith',
          'Peace through contentment in Christ'
        ],
        outline: [
          { section: 'Paul\'s Circumstances (1)', points: ['Thanksgiving and prayer', 'Joy in suffering'] },
          { section: 'Christ\'s Example (2)', points: ['Humility and unity', 'Christ\'s incarnation and exaltation'] },
          { section: 'Paul\'s Example (3)', points: ['Righteousness through faith', 'Pressing toward the goal'] },
          { section: 'Final Exhortations (4)', points: ['Joy and peace', 'Contentment', 'Thanksgiving'] }
        ],
        historicalContext: 'Written from prison in Rome to the church Paul had founded on his second missionary journey. The Philippian church had a special relationship with Paul, supporting his ministry financially. They sent Epaphroditus with a gift, and Paul wrote this thank-you letter.',
        keyVerses: [
          { reference: 'Philippians 1:21', text: 'For to me, to live is Christ and to die is gain.' },
          { reference: 'Philippians 2:5-8', text: 'Christ Jesus... made himself nothing... humbled himself by becoming obedient to death.' },
          { reference: 'Philippians 4:13', text: 'I can do all this through him who gives me strength.' }
        ],
        version: 1,
        updatedAt: new Date().toISOString()
      },
      JAS: {
        bookId: 'JAS',
        bookName: 'James',
        author: 'James, the brother of Jesus and leader of the Jerusalem church',
        dateWritten: 'c. AD 45-50',
        audience: 'Jewish Christians scattered throughout the Roman Empire',
        summary: 'James is a practical book focused on genuine faith that produces godly living. It addresses trials, temptation, favoritism, faith and works, controlling the tongue, wisdom, and prayer—calling believers to live out their faith authentically.',
        themes: [
          'Genuine faith produces works',
          'Trials and perseverance',
          'Control of the tongue',
          'Wisdom from God',
          'Impartiality and love',
          'Prayer and healing'
        ],
        outline: [
          { section: 'Trials and Temptation (1)', points: ['Joy in trials', 'Asking for wisdom', 'Doers of the word'] },
          { section: 'Favoritism Forbidden (2:1-13)', points: ['Impartiality in the church'] },
          { section: 'Faith and Works (2:14-26)', points: ['Faith without works is dead'] },
          { section: 'Taming the Tongue (3)', points: ['Power of the tongue', 'Heavenly wisdom'] },
          { section: 'Humility and Submission (4)', points: ['Friendship with the world', 'Submit to God'] },
          { section: 'Warnings and Encouragements (5)', points: ['Patience in suffering', 'Power of prayer'] }
        ],
        historicalContext: 'Likely the earliest New Testament book written. Jewish Christians were facing persecution and had been scattered from Jerusalem. James wrote to encourage them in practical Christian living while maintaining their faith under pressure.',
        keyVerses: [
          { reference: 'James 1:2-3', text: 'Consider it pure joy, my brothers and sisters, whenever you face trials of many kinds.' },
          { reference: 'James 1:22', text: 'Do not merely listen to the word, and so deceive yourselves. Do what it says.' },
          { reference: 'James 2:17', text: 'Faith by itself, if it is not accompanied by action, is dead.' }
        ],
        version: 1,
        updatedAt: new Date().toISOString()
      },
      '1PE': {
        bookId: '1PE',
        bookName: '1 Peter',
        author: 'Peter the apostle',
        dateWritten: 'c. AD 62-64',
        audience: 'Christians scattered throughout Asia Minor',
        summary: '1 Peter encourages believers suffering persecution to stand firm in their faith. It emphasizes their identity as God\'s chosen people, the hope of their salvation, and how to live godly lives in a hostile world.',
        themes: [
          'Living hope through Christ\'s resurrection',
          'Suffering for righteousness',
          'Identity as God\'s chosen people',
          'Holy living in a pagan society',
          'Submission to authorities',
          'The priesthood of all believers'
        ],
        outline: [
          { section: 'Salvation and Hope (1)', points: ['Living hope', 'Holy living'] },
          { section: 'The People of God (2:1-10)', points: ['Spiritual house', 'Royal priesthood'] },
          { section: 'Christian Conduct (2:11-3)', points: ['Submission to authorities', 'Suffering for doing good', 'Relationships'] },
          { section: 'Suffering and Glory (4-5)', points: ['Living for God', 'Shepherding the flock', 'Resisting the devil'] }
        ],
        historicalContext: 'Written during increasing persecution of Christians under Nero. Peter wrote from Rome ("Babylon") to strengthen believers facing trials and social ostracism for their faith. The letter addresses both Jewish and Gentile Christians.',
        keyVerses: [
          { reference: '1 Peter 1:3', text: 'In his great mercy he has given us new birth into a living hope through the resurrection of Jesus Christ.' },
          { reference: '1 Peter 2:9', text: 'You are a chosen people, a royal priesthood, a holy nation, God\'s special possession.' },
          { reference: '1 Peter 5:7', text: 'Cast all your anxiety on him because he cares for you.' }
        ],
        version: 1,
        updatedAt: new Date().toISOString()
      },
      '1JN': {
        bookId: '1JN',
        bookName: '1 John',
        author: 'John the apostle',
        dateWritten: 'c. AD 85-95',
        audience: 'Christians in Asia Minor',
        summary: '1 John addresses false teachings and provides assurance of salvation to true believers. It emphasizes the reality of Christ\'s incarnation, the importance of love, and tests of genuine faith—walking in light, loving others, and believing in Jesus.',
        themes: [
          'Assurance of salvation',
          'God is light and love',
          'Walking in the light',
          'Love for God and others',
          'Truth vs. false teaching',
          'Victory over sin and the world'
        ],
        outline: [
          { section: 'Walking in the Light (1-2:2)', points: ['Fellowship with God', 'Confession of sin'] },
          { section: 'Obedience and Love (2:3-27)', points: ['Knowing God through obedience', 'Love vs. hatred', 'Warning against antichrists'] },
          { section: 'Children of God (2:28-3)', points: ['Hope of Christ\'s return', 'Love in action'] },
          { section: 'Testing the Spirits (4)', points: ['Spirit of truth vs. error', 'God\'s love perfected in us'] },
          { section: 'Faith and Assurance (5)', points: ['Overcoming the world', 'Eternal life in the Son'] }
        ],
        historicalContext: 'Written to combat early Gnostic teachings that denied Christ\'s true humanity and promoted spiritual elitism. John wrote to churches he had overseen, providing tests to distinguish true believers from false teachers.',
        keyVerses: [
          { reference: '1 John 1:9', text: 'If we confess our sins, he is faithful and just and will forgive us our sins.' },
          { reference: '1 John 4:8', text: 'Whoever does not love does not know God, because God is love.' },
          { reference: '1 John 5:11-12', text: 'God has given us eternal life, and this life is in his Son.' }
        ],
        version: 1,
        updatedAt: new Date().toISOString()
      },
      REV: {
        bookId: 'REV',
        bookName: 'Revelation',
        author: 'John the apostle',
        dateWritten: 'c. AD 95-96',
        audience: 'Seven churches in Asia Minor and all believers',
        summary: 'Revelation unveils Jesus Christ in glory and reveals God\'s ultimate victory over evil. Written in apocalyptic imagery, it encourages persecuted believers with visions of Christ\'s return, final judgment, and the new heaven and earth.',
        themes: [
          'The sovereignty and glory of Christ',
          'God\'s ultimate victory over evil',
          'Encouragement to persevere in faith',
          'Judgment of the wicked',
          'Reward of the faithful',
          'The new creation'
        ],
        outline: [
          { section: 'Introduction (1)', points: ['Vision of the glorified Christ'] },
          { section: 'Letters to Seven Churches (2-3)', points: ['Commendation, correction, and promises'] },
          { section: 'The Throne Room (4-5)', points: ['Worship in heaven', 'The Lamb who was slain'] },
          { section: 'The Seven Seals, Trumpets, and Bowls (6-16)', points: ['God\'s judgments on the earth'] },
          { section: 'Babylon\'s Fall (17-18)', points: ['Judgment of the harlot'] },
          { section: 'Christ\'s Return and Victory (19-20)', points: ['Second coming', 'Millennium', 'Final judgment'] },
          { section: 'New Heaven and Earth (21-22)', points: ['New Jerusalem', 'Tree of life', 'Christ\'s return'] }
        ],
        historicalContext: 'Written during persecution under Emperor Domitian. John was exiled to Patmos for his faith. The book uses symbolic imagery familiar to first-century readers to encourage believers and warn them about compromising with the Roman imperial cult.',
        keyVerses: [
          { reference: 'Revelation 1:7-8', text: 'He is coming with the clouds... I am the Alpha and the Omega, says the Lord God.' },
          { reference: 'Revelation 21:4', text: 'He will wipe every tear from their eyes. There will be no more death or mourning or crying or pain.' },
          { reference: 'Revelation 22:20', text: 'He who testifies to these things says, "Yes, I am coming soon." Amen. Come, Lord Jesus.' }
        ],
        version: 1,
        updatedAt: new Date().toISOString()
      }
    };
    setStudyGuides(defaultGuides);
  };

  const getStudyGuide = (bookId) => {
    return studyGuides[bookId] || null;
  };

  const getAllStudyGuides = () => {
    return Object.values(studyGuides);
  };

  const searchStudyGuides = (query) => {
    const lowerQuery = query.toLowerCase();
    return Object.values(studyGuides).filter(guide =>
      guide.bookName.toLowerCase().includes(lowerQuery) ||
      guide.author.toLowerCase().includes(lowerQuery) ||
      guide.summary.toLowerCase().includes(lowerQuery) ||
      guide.themes.some(theme => theme.toLowerCase().includes(lowerQuery))
    );
  };

  const updateStudyGuide = (bookId, updates) => {
    setStudyGuides(prev => ({
      ...prev,
      [bookId]: {
        ...prev[bookId],
        ...updates,
        version: (prev[bookId]?.version || 1) + 1,
        updatedAt: new Date().toISOString()
      }
    }));
  };

  const value = {
    studyGuides,
    loading,
    getStudyGuide,
    getAllStudyGuides,
    searchStudyGuides,
    updateStudyGuide
  };

  return (
    <StudyGuideContext.Provider value={value}>
      {children}
    </StudyGuideContext.Provider>
  );
};
