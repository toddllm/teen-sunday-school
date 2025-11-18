import React, { createContext, useContext, useState, useEffect } from 'react';

const ContextCardContext = createContext();

export const useContextCards = () => {
  const context = useContext(ContextCardContext);
  if (!context) {
    throw new Error('useContextCards must be used within a ContextCardProvider');
  }
  return context;
};

export const ContextCardProvider = ({ children }) => {
  const [contextCards, setContextCards] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load context cards from localStorage on mount
  useEffect(() => {
    const storedCards = localStorage.getItem('sunday-school-context-cards');
    if (storedCards) {
      try {
        setContextCards(JSON.parse(storedCards));
      } catch (error) {
        console.error('Error loading context cards:', error);
      }
    } else {
      // Load example context cards if none exist
      loadExampleContextCards();
    }
    setLoading(false);
  }, []);

  // Save context cards to localStorage whenever they change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('sunday-school-context-cards', JSON.stringify(contextCards));
    }
  }, [contextCards, loading]);

  const loadExampleContextCards = () => {
    const exampleCards = [
      {
        id: 'context-john-3-16',
        verseRef: 'John 3:16',
        verseRange: 'John 3:16',
        historicalContext: 'Jesus spoke these words to Nicodemus, a Pharisee and member of the Jewish ruling council, during a nighttime conversation. This was early in Jesus\' ministry, and he was explaining the nature of spiritual rebirth and God\'s salvation plan.',
        literaryContext: 'This verse is part of Jesus\' discourse with Nicodemus about being "born again" (John 3:1-21). It represents a pivotal moment where Jesus transitions from discussing spiritual rebirth to explaining God\'s love and salvation plan for humanity.',
        keyTheme: 'God\'s sacrificial love and the offer of eternal life through faith in Jesus Christ.',
        crossReferences: [
          {
            ref: 'Romans 5:8',
            note: 'God demonstrates his love for us in that while we were still sinners, Christ died for us.'
          },
          {
            ref: '1 John 4:9-10',
            note: 'God\'s love was revealed among us in this way: God sent his only Son into the world so that we might live through him.'
          },
          {
            ref: 'John 1:12',
            note: 'To all who believed in his name, he gave the right to become children of God.'
          }
        ],
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'context-james-2-14-26',
        verseRef: 'James 2:14-26',
        verseRange: 'James 2:14-26',
        historicalContext: 'James wrote this letter to Jewish Christians scattered throughout the Roman Empire. Many were facing persecution and poverty. Some believers were claiming faith but not living it out practically.',
        literaryContext: 'This passage follows James\' teaching on partiality and favoritism (James 2:1-13). James is addressing a disconnect between professed faith and practical living, arguing that genuine faith naturally produces good works.',
        keyTheme: 'Authentic faith is demonstrated through actions. Faith and works are inseparable—works are the visible evidence of invisible faith.',
        crossReferences: [
          {
            ref: 'Ephesians 2:8-10',
            note: 'We are saved by grace through faith, not by works—but we are created in Christ Jesus to do good works.'
          },
          {
            ref: 'Matthew 7:16-20',
            note: 'You will recognize them by their fruits. A good tree cannot bear bad fruit.'
          },
          {
            ref: 'Galatians 5:6',
            note: 'The only thing that counts is faith expressing itself through love.'
          },
          {
            ref: 'Titus 2:14',
            note: 'Christ gave himself to redeem us and to purify for himself a people eager to do good works.'
          }
        ],
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'context-matthew-5-38-42',
        verseRef: 'Matthew 5:38-42',
        verseRange: 'Matthew 5:38-42',
        historicalContext: 'In the Sermon on the Mount, Jesus is teaching about the Kingdom of God. The principle "eye for eye, tooth for tooth" (lex talionis) was from the Old Testament law (Exodus 21:24) and was meant to limit revenge by making punishment proportional to the offense.',
        literaryContext: 'This is part of Jesus\' six "You have heard... but I tell you" statements in Matthew 5, where he goes beyond external law-keeping to address heart attitudes. He\'s teaching his followers to exceed the righteousness of the Pharisees (Matthew 5:20).',
        keyTheme: 'Kingdom citizens should respond to evil and injustice with unexpected grace, non-retaliation, and generosity—reflecting God\'s character rather than seeking personal justice.',
        crossReferences: [
          {
            ref: 'Romans 12:17-21',
            note: 'Do not repay evil for evil. If your enemy is hungry, feed him. Overcome evil with good.'
          },
          {
            ref: '1 Peter 2:21-23',
            note: 'Christ suffered for you, leaving an example. When he was insulted, he did not retaliate.'
          },
          {
            ref: 'Luke 6:27-36',
            note: 'Love your enemies, do good to those who hate you, be merciful as your Father is merciful.'
          },
          {
            ref: 'Proverbs 25:21-22',
            note: 'If your enemy is hungry, give him food to eat; if he is thirsty, give him water to drink.'
          }
        ],
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'context-genesis-1-1-3',
        verseRef: 'Genesis 1:1-3',
        verseRange: 'Genesis 1:1-3',
        historicalContext: 'Genesis was written to the Israelites, likely during or after their exodus from Egypt. Surrounded by cultures with multiple gods and chaotic creation myths, Genesis presents one sovereign God who creates with purpose and order.',
        literaryContext: 'This is the opening of the Bible and the foundation for all biblical theology. It establishes God as Creator, introduces the concept of creation by divine word, and sets up the creation week narrative (Genesis 1:1-2:3).',
        keyTheme: 'God is the eternal, all-powerful Creator who brought everything into existence by His word. Creation was intentional, orderly, and good.',
        crossReferences: [
          {
            ref: 'John 1:1-3',
            note: 'In the beginning was the Word... all things were made through him, echoing Genesis 1.'
          },
          {
            ref: 'Colossians 1:15-17',
            note: 'Christ is the image of the invisible God; all things were created through him and for him.'
          },
          {
            ref: 'Hebrews 11:3',
            note: 'By faith we understand that the universe was created by the word of God.'
          },
          {
            ref: 'Psalm 33:6-9',
            note: 'By the word of the LORD the heavens were made; he spoke, and it came to be.'
          }
        ],
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'context-ephesians-2-8-9',
        verseRef: 'Ephesians 2:8-9',
        verseRange: 'Ephesians 2:8-9',
        historicalContext: 'Paul wrote to the church in Ephesus, a major city with a mix of Jewish and Gentile believers. The Ephesian culture was steeped in pagan worship and spiritual darkness, making the transition to understanding grace especially significant.',
        literaryContext: 'These verses are part of a larger section (Ephesians 2:1-10) contrasting our former state (dead in sin) with our new state (alive in Christ). Verses 8-9 emphasize how we are saved, while verse 10 explains the purpose of our salvation.',
        keyTheme: 'Salvation is entirely a gift of God\'s grace, received through faith, not earned by human effort—so that no one can boast.',
        crossReferences: [
          {
            ref: 'Romans 3:23-24',
            note: 'All have sinned and fall short, and are justified freely by his grace through redemption in Christ.'
          },
          {
            ref: 'Titus 3:5',
            note: 'He saved us, not because of righteous things we had done, but because of his mercy.'
          },
          {
            ref: 'Romans 11:6',
            note: 'If by grace, then it cannot be based on works; if it were, grace would no longer be grace.'
          },
          {
            ref: 'Ephesians 2:10',
            note: 'We are created in Christ Jesus to do good works, which God prepared in advance for us to do.'
          }
        ],
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    setContextCards(exampleCards);
  };

  const addContextCard = (card) => {
    const newCard = {
      ...card,
      id: `context-${Date.now()}`,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setContextCards([...contextCards, newCard]);
    return newCard.id;
  };

  const updateContextCard = (id, updates) => {
    setContextCards(contextCards.map(card =>
      card.id === id
        ? {
          ...card,
          ...updates,
          version: (card.version || 1) + 1,
          updatedAt: new Date().toISOString()
        }
        : card
    ));
  };

  const deleteContextCard = (id) => {
    setContextCards(contextCards.filter(card => card.id !== id));
  };

  const getContextCardByVerseRef = (verseRef) => {
    // Normalize the verse reference for comparison
    const normalizedRef = verseRef.trim().toLowerCase();

    return contextCards.find(card => {
      const cardRef = card.verseRef.trim().toLowerCase();
      return cardRef === normalizedRef;
    });
  };

  const getContextCardById = (id) => {
    return contextCards.find(card => card.id === id);
  };

  const searchContextCards = (query) => {
    const lowerQuery = query.toLowerCase();
    return contextCards.filter(card =>
      card.verseRef.toLowerCase().includes(lowerQuery) ||
      card.historicalContext?.toLowerCase().includes(lowerQuery) ||
      card.literaryContext?.toLowerCase().includes(lowerQuery) ||
      card.keyTheme?.toLowerCase().includes(lowerQuery)
    );
  };

  const value = {
    contextCards,
    loading,
    addContextCard,
    updateContextCard,
    deleteContextCard,
    getContextCardByVerseRef,
    getContextCardById,
    searchContextCards
  };

  return (
    <ContextCardContext.Provider value={value}>
      {children}
    </ContextCardContext.Provider>
  );
};
