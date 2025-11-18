import React, { createContext, useContext, useState, useEffect } from 'react';

const CollectionsContext = createContext();

export const useCollections = () => {
  const context = useContext(CollectionsContext);
  if (!context) {
    throw new Error('useCollections must be used within a CollectionsProvider');
  }
  return context;
};

export const CollectionsProvider = ({ children }) => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load collections from localStorage on mount
  useEffect(() => {
    const storedCollections = localStorage.getItem('verse-collections');
    if (storedCollections) {
      try {
        setCollections(JSON.parse(storedCollections));
      } catch (error) {
        console.error('Error loading collections:', error);
      }
    }
    setLoading(false);
  }, []);

  // Save collections to localStorage whenever they change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('verse-collections', JSON.stringify(collections));
    }
  }, [collections, loading]);

  const addCollection = (collection) => {
    const newCollection = {
      ...collection,
      id: `collection-${Date.now()}`,
      verses: collection.verses || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setCollections([...collections, newCollection]);
    return newCollection.id;
  };

  const updateCollection = (id, updates) => {
    setCollections(collections.map(collection =>
      collection.id === id
        ? { ...collection, ...updates, updatedAt: new Date().toISOString() }
        : collection
    ));
  };

  const deleteCollection = (id) => {
    setCollections(collections.filter(collection => collection.id !== id));
  };

  const getCollectionById = (id) => {
    return collections.find(collection => collection.id === id);
  };

  const addVerseToCollection = (collectionId, verse) => {
    const collection = getCollectionById(collectionId);
    if (collection) {
      // Check if verse already exists in collection
      const verseExists = collection.verses.some(v => v.reference === verse.reference);
      if (!verseExists) {
        const newVerse = {
          ...verse,
          id: `verse-${Date.now()}`,
          addedAt: new Date().toISOString()
        };
        updateCollection(collectionId, {
          verses: [...collection.verses, newVerse]
        });
        return true;
      }
      return false; // Verse already exists
    }
    return false;
  };

  const removeVerseFromCollection = (collectionId, verseId) => {
    const collection = getCollectionById(collectionId);
    if (collection) {
      updateCollection(collectionId, {
        verses: collection.verses.filter(v => v.id !== verseId)
      });
      return true;
    }
    return false;
  };

  const reorderVerses = (collectionId, verses) => {
    updateCollection(collectionId, { verses });
  };

  const updateVerseNote = (collectionId, verseId, note) => {
    const collection = getCollectionById(collectionId);
    if (collection) {
      const updatedVerses = collection.verses.map(v =>
        v.id === verseId ? { ...v, note } : v
      );
      updateCollection(collectionId, { verses: updatedVerses });
      return true;
    }
    return false;
  };

  const value = {
    collections,
    loading,
    addCollection,
    updateCollection,
    deleteCollection,
    getCollectionById,
    addVerseToCollection,
    removeVerseFromCollection,
    reorderVerses,
    updateVerseNote
  };

  return (
    <CollectionsContext.Provider value={value}>
      {children}
    </CollectionsContext.Provider>
  );
};
