import React, { createContext, useState, useContext } from 'react';

const KidsContentContext = createContext();

export const useKidsContent = () => {
  const context = useContext(KidsContentContext);
  if (!context) {
    throw new Error('useKidsContent must be used within a KidsContentProvider');
  }
  return context;
};

// Curated kids content with age-appropriate Bible stories
const KIDS_CONTENT = [
  {
    id: 'creation-story',
    title: 'God Creates the World',
    type: 'story',
    category: 'favorite',
    passageRefs: ['Genesis 1:1-31', 'Genesis 2:1-3'],
    ageRange: '4-12',
    duration: '5 min',
    emoji: '🌍',
    summary: 'Learn about how God created the beautiful world and everything in it!',
    content: `In the beginning, God created the heavens and the earth.

On the first day, God said, "Let there be light!" And there was light!

On the second day, God made the sky.

On the third day, God made the land, the oceans, and all the plants and trees.

On the fourth day, God made the sun, moon, and stars.

On the fifth day, God made all the fish and birds.

On the sixth day, God made all the animals, and then He made people! God saw that everything was very good.

On the seventh day, God rested.`,
    audioEnabled: true,
    illustration: 'https://via.placeholder.com/400x300/87CEEB/FFFFFF?text=Creation',
    memoryVerse: {
      text: 'In the beginning God created the heavens and the earth.',
      reference: 'Genesis 1:1'
    },
    questions: [
      'What did God create on the first day?',
      'What did God create on the sixth day?',
      'How many days did God take to create everything?'
    ]
  },
  {
    id: 'noah-ark',
    title: "Noah's Big Boat",
    type: 'story',
    category: 'favorite',
    passageRefs: ['Genesis 6:9-22', 'Genesis 7:1-24', 'Genesis 8:1-19'],
    ageRange: '4-12',
    duration: '7 min',
    emoji: '🚢',
    summary: 'Discover how Noah built a huge boat and saved all the animals!',
    content: `Noah was a good man who loved God. One day, God told Noah, "I am going to send a big flood. Build a big boat called an ark!"

Noah obeyed God and built the ark. It was HUGE! Big enough for Noah's family and two of every kind of animal.

When the ark was ready, the animals came - elephants, lions, monkeys, birds, and many more! They all went into the ark.

Then it started to rain. And rain. And rain! For 40 days and 40 nights! The whole earth was covered with water.

But Noah, his family, and all the animals were safe inside the ark.

After many days, the rain stopped. God sent a rainbow as a promise that He would never flood the whole earth again.

Noah and his family thanked God for keeping them safe!`,
    audioEnabled: true,
    illustration: 'https://via.placeholder.com/400x300/4169E1/FFFFFF?text=Noah+Ark',
    memoryVerse: {
      text: 'Noah did everything just as God commanded him.',
      reference: 'Genesis 6:22'
    },
    questions: [
      'Why did Noah build the ark?',
      'How long did it rain?',
      'What did God send as a promise?'
    ]
  },
  {
    id: 'david-goliath',
    title: 'David and the Giant',
    type: 'story',
    category: 'favorite',
    passageRefs: ['1 Samuel 17:1-50'],
    ageRange: '5-12',
    duration: '6 min',
    emoji: '⚔️',
    summary: 'See how brave David defeated the giant Goliath with God\'s help!',
    content: `David was a young shepherd boy who took care of sheep. He loved God very much.

One day, a GIANT named Goliath came to fight God's people. Goliath was over 9 feet tall! All the soldiers were scared.

But David was brave. He said, "I will fight Goliath! God will help me!"

David didn't wear armor or carry a sword. He took his sling and five smooth stones from a stream.

Goliath laughed at David. But David said, "You come with a sword and spear, but I come in the name of the Lord!"

David put a stone in his sling, swung it around, and WHOOSH! The stone hit Goliath right on the forehead. The giant fell down!

Everyone cheered! David won because God was with him.

We can be brave like David when we trust in God!`,
    audioEnabled: true,
    illustration: 'https://via.placeholder.com/400x300/FFD700/000000?text=David',
    memoryVerse: {
      text: 'The Lord is my helper; I will not be afraid.',
      reference: 'Hebrews 13:6'
    },
    questions: [
      'What was David\'s job before fighting Goliath?',
      'What did David use to defeat Goliath?',
      'Why was David brave?'
    ]
  },
  {
    id: 'daniel-lions',
    title: 'Daniel and the Lions',
    type: 'story',
    category: 'favorite',
    passageRefs: ['Daniel 6:1-23'],
    ageRange: '5-12',
    duration: '6 min',
    emoji: '🦁',
    summary: 'Find out how God protected Daniel in the lions\' den!',
    content: `Daniel loved God and prayed to Him three times every day.

Some men didn't like Daniel. They tricked the king into making a bad law: "No one can pray to anyone except the king for 30 days!"

But Daniel kept praying to God anyway. The bad men saw him and told the king.

The king was sad, but he had to follow his law. Daniel was thrown into a den full of hungry lions!

The king couldn't sleep. He worried about Daniel all night.

In the morning, the king ran to the lions' den and called out, "Daniel! Did your God save you?"

Daniel answered, "Yes! God sent an angel to close the lions' mouths. They didn't hurt me at all!"

The king was so happy! He made a new law: "Everyone should honor Daniel's God!"

God protected Daniel because Daniel was faithful.`,
    audioEnabled: true,
    illustration: 'https://via.placeholder.com/400x300/FFA500/FFFFFF?text=Lions+Den',
    memoryVerse: {
      text: 'My God sent his angel and he shut the mouths of the lions.',
      reference: 'Daniel 6:22'
    },
    questions: [
      'How many times did Daniel pray each day?',
      'What happened when Daniel was in the lions\' den?',
      'Who protected Daniel from the lions?'
    ]
  },
  {
    id: 'jesus-birth',
    title: 'Baby Jesus is Born',
    type: 'story',
    category: 'today',
    passageRefs: ['Luke 2:1-20'],
    ageRange: '3-12',
    duration: '5 min',
    emoji: '⭐',
    summary: 'Celebrate the wonderful night when Jesus was born!',
    content: `Long ago, Mary and Joseph had to travel to Bethlehem. Mary was going to have a baby very soon!

When they got to Bethlehem, there was no room for them at the inn. They had to stay in a stable where animals lived.

That night, baby Jesus was born! Mary wrapped Him in cloths and laid Him in a manger - a feeding box for animals.

In the fields nearby, shepherds were watching their sheep. Suddenly, an angel appeared! The shepherds were scared!

The angel said, "Don't be afraid! I bring you good news of great joy! Today, a Savior has been born! He is Christ the Lord!"

Then the whole sky filled with angels singing, "Glory to God in the highest!"

The shepherds hurried to Bethlehem and found baby Jesus, just as the angel had said. They were so happy!

Jesus came to save us all. He is God's special gift of love!`,
    audioEnabled: true,
    illustration: 'https://via.placeholder.com/400x300/4169E1/FFFFFF?text=Baby+Jesus',
    memoryVerse: {
      text: 'Today in the town of David a Savior has been born to you; he is the Messiah, the Lord.',
      reference: 'Luke 2:11'
    },
    questions: [
      'Where was Jesus born?',
      'Who came to visit baby Jesus?',
      'What did the angels say?'
    ]
  },
  {
    id: 'good-samaritan',
    title: 'The Good Helper',
    type: 'story',
    category: 'today',
    passageRefs: ['Luke 10:25-37'],
    ageRange: '4-12',
    duration: '5 min',
    emoji: '❤️',
    summary: 'Learn how to be kind and helpful to everyone!',
    content: `Jesus told a story about being kind:

One day, a man was walking on a road. Bad men hurt him and took his money. They left him lying on the road.

A priest walked by. He saw the hurt man but walked past on the other side of the road.

Another religious man walked by. He also saw the hurt man but didn't stop to help.

Then a Samaritan man came along. When he saw the hurt man, he felt sorry for him.

The Samaritan stopped! He put bandages on the man's wounds. He put the hurt man on his donkey and took him to an inn.

The Samaritan paid for the man's room and food. He made sure the hurt man was taken care of.

Jesus said, "Go and be kind like the Good Samaritan. Help people who need it!"

We can show God's love by being kind and helpful to everyone!`,
    audioEnabled: true,
    illustration: 'https://via.placeholder.com/400x300/90EE90/000000?text=Good+Samaritan',
    memoryVerse: {
      text: 'Love your neighbor as yourself.',
      reference: 'Luke 10:27'
    },
    questions: [
      'Who stopped to help the hurt man?',
      'What did the Good Samaritan do?',
      'How can you be like the Good Samaritan?'
    ]
  },
  {
    id: 'lords-prayer',
    title: "Jesus Teaches Us to Pray",
    type: 'song',
    category: 'songs',
    passageRefs: ['Matthew 6:9-13'],
    ageRange: '5-12',
    duration: '3 min',
    emoji: '🙏',
    summary: 'Learn the special prayer Jesus taught us!',
    content: `Jesus taught His friends how to pray. This prayer is called "The Lord's Prayer":

Our Father in heaven,
Hallowed be Your name.
Your kingdom come,
Your will be done,
On earth as it is in heaven.

Give us this day our daily bread,
And forgive us our sins,
As we forgive those who sin against us.

Lead us not into temptation,
But deliver us from evil.

For Yours is the kingdom,
And the power,
And the glory,
Forever and ever.
Amen!

This prayer helps us remember to:
- Honor God's name
- Ask for what we need
- Forgive others
- Ask God to help us do what's right`,
    audioEnabled: true,
    illustration: 'https://via.placeholder.com/400x300/DDA0DD/FFFFFF?text=Prayer',
    memoryVerse: {
      text: 'This, then, is how you should pray: Our Father in heaven, hallowed be your name.',
      reference: 'Matthew 6:9'
    }
  },
  {
    id: 'jesus-loves-me',
    title: 'Jesus Loves Me Song',
    type: 'song',
    category: 'songs',
    passageRefs: ['1 John 4:19'],
    ageRange: '3-12',
    duration: '2 min',
    emoji: '💕',
    summary: 'Sing about how much Jesus loves you!',
    content: `Jesus loves me, this I know,
For the Bible tells me so.
Little ones to Him belong,
They are weak, but He is strong.

Yes, Jesus loves me!
Yes, Jesus loves me!
Yes, Jesus loves me!
The Bible tells me so!

Jesus loves me, He who died,
Heaven's gate to open wide.
He will wash away my sin,
Let His little child come in.

Yes, Jesus loves me!
Yes, Jesus loves me!
Yes, Jesus loves me!
The Bible tells me so!`,
    audioEnabled: true,
    illustration: 'https://via.placeholder.com/400x300/FF69B4/FFFFFF?text=Jesus+Loves+Me',
    memoryVerse: {
      text: 'We love because he first loved us.',
      reference: '1 John 4:19'
    }
  },
  {
    id: 'psalm-23',
    title: 'The Lord is My Shepherd',
    type: 'song',
    category: 'songs',
    passageRefs: ['Psalm 23:1-6'],
    ageRange: '5-12',
    duration: '3 min',
    emoji: '🐑',
    summary: 'Learn this beautiful psalm about God taking care of us!',
    content: `The Lord is my shepherd,
I shall not want.
He makes me lie down in green pastures,
He leads me beside quiet waters,
He refreshes my soul.

He guides me along the right paths
For His name's sake.
Even though I walk through the darkest valley,
I will fear no evil,
For You are with me!

Your rod and Your staff,
They comfort me.
You prepare a table before me,
You anoint my head with oil,
My cup overflows!

Surely your goodness and love will follow me
All the days of my life,
And I will dwell in the house of the Lord
Forever!

This psalm tells us that God is like a good shepherd who takes care of His sheep. We are His sheep, and He loves us and protects us always!`,
    audioEnabled: true,
    illustration: 'https://via.placeholder.com/400x300/98FB98/000000?text=Shepherd',
    memoryVerse: {
      text: 'The Lord is my shepherd, I lack nothing.',
      reference: 'Psalm 23:1'
    }
  }
];

export const KidsContentProvider = ({ children }) => {
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('kids-favorites');
    return saved ? JSON.parse(saved) : [];
  });

  const [completedStories, setCompletedStories] = useState(() => {
    const saved = localStorage.getItem('kids-completed-stories');
    return saved ? JSON.parse(saved) : [];
  });

  // Get content by ID
  const getContentById = (id) => {
    return KIDS_CONTENT.find(item => item.id === id);
  };

  // Get all stories
  const getStories = () => {
    return KIDS_CONTENT.filter(item => item.type === 'story');
  };

  // Get all songs/verses
  const getSongs = () => {
    return KIDS_CONTENT.filter(item => item.type === 'song');
  };

  // Get today's featured story (rotates based on day of year)
  const getTodaysStory = () => {
    const stories = getStories();
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    const index = dayOfYear % stories.length;
    return stories[index];
  };

  // Get favorite stories
  const getFavoriteStories = () => {
    return KIDS_CONTENT.filter(item => favorites.includes(item.id));
  };

  // Toggle favorite
  const toggleFavorite = (id) => {
    const newFavorites = favorites.includes(id)
      ? favorites.filter(favId => favId !== id)
      : [...favorites, id];

    setFavorites(newFavorites);
    localStorage.setItem('kids-favorites', JSON.stringify(newFavorites));
  };

  // Check if content is favorited
  const isFavorite = (id) => {
    return favorites.includes(id);
  };

  // Mark story as completed
  const markCompleted = (id) => {
    if (!completedStories.includes(id)) {
      const newCompleted = [...completedStories, id];
      setCompletedStories(newCompleted);
      localStorage.setItem('kids-completed-stories', JSON.stringify(newCompleted));
    }
  };

  // Check if story is completed
  const isCompleted = (id) => {
    return completedStories.includes(id);
  };

  // Get content by category
  const getContentByCategory = (category) => {
    return KIDS_CONTENT.filter(item => item.category === category);
  };

  // Get content by age range
  const getContentByAge = (minAge, maxAge) => {
    return KIDS_CONTENT.filter(item => {
      const [min, max] = item.ageRange.split('-').map(Number);
      return (minAge >= min && minAge <= max) || (maxAge >= min && maxAge <= max);
    });
  };

  const value = {
    allContent: KIDS_CONTENT,
    getContentById,
    getStories,
    getSongs,
    getTodaysStory,
    getFavoriteStories,
    toggleFavorite,
    isFavorite,
    markCompleted,
    isCompleted,
    getContentByCategory,
    getContentByAge,
    stats: {
      totalStories: getStories().length,
      totalSongs: getSongs().length,
      completedCount: completedStories.length,
      favoritesCount: favorites.length
    }
  };

  return (
    <KidsContentContext.Provider value={value}>
      {children}
    </KidsContentContext.Provider>
  );
};
