/**
 * Seed data for icebreakers
 * This provides a starter library of icebreakers for organizations
 */

export const icebreakerSeeds = [
  {
    title: 'Two Truths and a Lie',
    description: 'A classic icebreaker where students share three statements about themselves, two true and one false.',
    instructions: `1. Have each student think of two true facts about themselves and one believable lie.
2. Go around the circle and have each person share their three statements.
3. The group guesses which statement is the lie.
4. After everyone guesses, the person reveals which was false.
5. Optional: Keep score of who guesses correctly the most!`,
    category: 'get-to-know',
    ageGroup: 'all',
    groupSize: 'any',
    energyLevel: 'low',
    durationMinutes: 15,
    materialsNeeded: [],
    questions: [
      'Share three statements: two truths and one lie about yourself',
      'Can the group guess which one is the lie?',
    ],
    tags: ['classic', 'simple', 'no-prep'],
    isPublic: true,
    isTemplate: true,
  },
  {
    title: 'Would You Rather - Faith Edition',
    description: 'Faith-based version of the popular game with thought-provoking spiritual questions.',
    instructions: `1. Pose "Would You Rather" questions to the group.
2. Have students move to different sides of the room based on their choice.
3. Ask a few people from each side to explain their reasoning.
4. Discuss how our choices reflect our values and faith.`,
    category: 'faith-based',
    ageGroup: 'high',
    groupSize: 'any',
    energyLevel: 'medium',
    durationMinutes: 10,
    materialsNeeded: [],
    questions: [
      'Would you rather pray for 1 hour or read the Bible for 3 hours?',
      'Would you rather go on a mission trip or serve in your local community for a month?',
      'Would you rather have answered prayers immediately or grow closer to God through waiting?',
      'Would you rather share your faith with strangers or disciple a close friend?',
      'Would you rather attend worship services daily or have deep spiritual conversations weekly?',
    ],
    tags: ['faith', 'discussion', 'no-prep'],
    isPublic: true,
    isTemplate: true,
  },
  {
    title: 'Human Knot',
    description: 'A physical teamwork challenge that requires cooperation and communication.',
    instructions: `1. Have the group stand in a tight circle.
2. Everyone reaches across and grabs two different hands (not the person next to them).
3. Without letting go, the group must untangle themselves into a circle.
4. Encourage communication and teamwork.
5. Debrief: How is this like working together in the body of Christ?`,
    category: 'energizer',
    ageGroup: 'all',
    groupSize: 'medium',
    energyLevel: 'high',
    durationMinutes: 10,
    materialsNeeded: [],
    questions: [],
    tags: ['teamwork', 'physical', 'no-prep'],
    isPublic: true,
    isTemplate: true,
  },
  {
    title: 'Highs and Lows',
    description: 'Share the best and most challenging parts of your week.',
    instructions: `1. Go around the circle and have each person share:
   - One high (best moment) from their week
   - One low (challenging moment) from their week
2. Optional: Add a third category "Where did you see God this week?"
3. Encourage active listening without trying to "fix" people's lows.
4. Close with a prayer for the lows shared.`,
    category: 'get-to-know',
    ageGroup: 'all',
    groupSize: 'small',
    energyLevel: 'low',
    durationMinutes: 15,
    materialsNeeded: [],
    questions: [
      'What was your high (best moment) this week?',
      'What was your low (challenging moment) this week?',
      'Where did you see God at work in your life this week?',
    ],
    tags: ['sharing', 'pastoral', 'regular'],
    isPublic: true,
    isTemplate: true,
  },
  {
    title: 'If You Really Knew Me',
    description: 'A deeper sharing activity for building authentic community.',
    instructions: `1. Explain that this is a safe space for honest sharing.
2. Have each person complete the sentence: "If you really knew me, you would know..."
3. Go around the circle, allowing people to share at their comfort level.
4. Emphasize confidentiality and respect.
5. Leaders should model vulnerability by going first.
6. Thank everyone for their courage in sharing.`,
    category: 'deep-discussion',
    ageGroup: 'high',
    groupSize: 'small',
    energyLevel: 'low',
    durationMinutes: 20,
    materialsNeeded: [],
    questions: [
      'If you really knew me, you would know...',
    ],
    tags: ['vulnerability', 'deep', 'trust-building'],
    isPublic: true,
    isTemplate: true,
  },
  {
    title: 'Beach Ball Questions',
    description: 'Toss a beach ball with questions written on it for random sharing.',
    instructions: `1. Before class, write different questions on a beach ball with permanent marker.
2. Toss the ball around the group.
3. When someone catches it, they answer the question under their right thumb.
4. Keep tossing for 10-15 minutes.
5. Questions can be silly, serious, or faith-based!`,
    category: 'get-to-know',
    ageGroup: 'middle',
    groupSize: 'medium',
    energyLevel: 'medium',
    durationMinutes: 15,
    materialsNeeded: ['Beach ball', 'Permanent marker'],
    questions: [
      'What's your favorite food?',
      'If you could have any superpower, what would it be?',
      'What's one thing you're grateful for today?',
      'Who is a hero of faith you admire?',
      'What's your favorite Bible story?',
    ],
    tags: ['fun', 'active', 'prep-required'],
    isPublic: true,
    isTemplate: true,
  },
  {
    title: 'Four Corners',
    description: 'Students move to different corners based on their preferences.',
    instructions: `1. Assign each corner of the room a category (e.g., Spring, Summer, Fall, Winter).
2. Ask a question and have students move to their answer's corner.
3. In their corners, students share why they chose that option.
4. Ask new questions with new corner categories.
5. Mix light and deep questions for variety.`,
    category: 'energizer',
    ageGroup: 'all',
    groupSize: 'large',
    energyLevel: 'medium',
    durationMinutes: 10,
    materialsNeeded: ['Signs for corners (optional)'],
    questions: [
      'Favorite season: Spring, Summer, Fall, or Winter?',
      'How do you recharge: Alone, With friends, In nature, or Serving others?',
      'Bible character you relate to: David, Peter, Mary, or Paul?',
      'Preferred worship style: Traditional, Contemporary, Quiet reflection, or Energetic praise?',
    ],
    tags: ['movement', 'preferences', 'adaptable'],
    isPublic: true,
    isTemplate: true,
  },
  {
    title: 'Rose, Thorn, and Bud',
    description: 'Share a highlight, challenge, and something you're looking forward to.',
    instructions: `1. Explain the three parts:
   - Rose: Something good that happened
   - Thorn: A challenge or difficulty
   - Bud: Something you're looking forward to
2. Go around and have each person share their rose, thorn, and bud.
3. This can be from the past week or even just today.
4. Encourage listening and empathy.
5. Optional: Pray for the thorns and buds shared.`,
    category: 'get-to-know',
    ageGroup: 'all',
    groupSize: 'any',
    energyLevel: 'low',
    durationMinutes: 15,
    materialsNeeded: [],
    questions: [
      'Rose: What's something good that happened?',
      'Thorn: What's a challenge you're facing?',
      'Bud: What's something you're looking forward to?',
    ],
    tags: ['sharing', 'reflection', 'regular-use'],
    isPublic: true,
    isTemplate: true,
  },
  {
    title: 'Scripture Speed Drill',
    description: 'Fast-paced game to find Bible verses quickly.',
    instructions: `1. Divide into teams of 3-4 students.
2. Each team needs a Bible.
3. Call out a Bible reference (e.g., "John 3:16!").
4. Teams race to find it first.
5. First team to find it and read it aloud wins a point.
6. Play for 10 minutes or until you reach a target score.
7. Mix well-known and obscure verses!`,
    category: 'faith-based',
    ageGroup: 'all',
    groupSize: 'medium',
    energyLevel: 'high',
    durationMinutes: 10,
    materialsNeeded: ['Bibles (one per team)', 'List of verses'],
    questions: [],
    tags: ['competitive', 'bible', 'energetic'],
    isPublic: true,
    isTemplate: true,
  },
  {
    title: 'Compliment Circle',
    description: 'Build each other up by sharing affirmations.',
    instructions: `1. Sit in a circle.
2. One person sits in the middle (or spotlight).
3. Going around the circle, each person shares one genuine compliment or affirmation about that person.
4. Encourage specific observations rather than generic praise.
5. The person in the middle just receives - no need to respond.
6. Continue until everyone has been in the middle.
7. This works best with established groups who know each other.`,
    category: 'deep-discussion',
    ageGroup: 'high',
    groupSize: 'small',
    energyLevel: 'low',
    durationMinutes: 25,
    materialsNeeded: [],
    questions: [],
    tags: ['affirmation', 'building-up', 'established-groups'],
    isPublic: true,
    isTemplate: true,
  },
];

export default icebreakerSeeds;
