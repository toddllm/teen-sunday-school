import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import './BookHeatmap.css';

const BookHeatmap = ({ data, title = "Scripture Book Engagement" }) => {
  // Generate color based on count (heatmap style)
  const getColor = (count, maxCount) => {
    if (count === 0) return '#f0f0f0';
    const intensity = count / maxCount;

    if (intensity > 0.75) return '#1e40af'; // Dark blue
    if (intensity > 0.5) return '#3b82f6';  // Blue
    if (intensity > 0.25) return '#60a5fa'; // Light blue
    return '#93c5fd'; // Very light blue
  };

  const maxCount = Math.max(...data.map(d => d.count), 1);

  // Separate Old and New Testament
  const oldTestamentBooks = [
    'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
    'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel', '1 Kings', '2 Kings',
    '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah', 'Esther',
    'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon',
    'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel',
    'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum',
    'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi'
  ];

  const newTestamentBooks = [
    'Matthew', 'Mark', 'Luke', 'John', 'Acts',
    'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians',
    'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians',
    '1 Timothy', '2 Timothy', 'Titus', 'Philemon',
    'Hebrews', 'James', '1 Peter', '2 Peter',
    '1 John', '2 John', '3 John', 'Jude', 'Revelation'
  ];

  const otData = data.filter(d => oldTestamentBooks.includes(d.book) && d.count > 0);
  const ntData = data.filter(d => newTestamentBooks.includes(d.book) && d.count > 0);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="book-heatmap-tooltip">
          <p className="tooltip-label">{payload[0].payload.book}</p>
          <p className="tooltip-value">Reads: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="book-heatmap">
      <h3>{title}</h3>

      {data.every(d => d.count === 0) ? (
        <div className="empty-state">
          <p>No scripture reading data available for this period.</p>
        </div>
      ) : (
        <>
          {/* Old Testament */}
          {otData.length > 0 && (
            <div className="testament-section">
              <h4>Old Testament</h4>
              <ResponsiveContainer width="100%" height={Math.max(300, otData.length * 20)}>
                <BarChart
                  data={otData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="book" type="category" width={90} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Reads">
                    {otData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getColor(entry.count, maxCount)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* New Testament */}
          {ntData.length > 0 && (
            <div className="testament-section">
              <h4>New Testament</h4>
              <ResponsiveContainer width="100%" height={Math.max(300, ntData.length * 20)}>
                <BarChart
                  data={ntData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="book" type="category" width={90} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Reads">
                    {ntData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getColor(entry.count, maxCount)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Legend */}
          <div className="heatmap-legend">
            <span className="legend-label">Heat intensity:</span>
            <div className="legend-colors">
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#93c5fd' }}></div>
                <span>Low</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#60a5fa' }}></div>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#3b82f6' }}></div>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#1e40af' }}></div>
                <span>High</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BookHeatmap;
