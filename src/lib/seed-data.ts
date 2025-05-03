import { db } from "@/database/db";
import { 
  users, 
  languages, 
  stories, 
  culturalTags, 
  storyTags,
  comics,
  comicPanels
} from "@/database/AI-For-Good/schema";

/**
 * Seed the database with sample data for demo purposes
 */
export async function seedDemoData() {
  console.log("Seeding demo data...");

  try {
    // Check if already seeded
    const existingStories = await db.select({ count: sql`COUNT(*)` }).from(stories);
    if (existingStories[0].count > 0) {
      console.log("Data already seeded. Skipping.");
      return;
    }

    // Seed languages
    const languageData = [
      { code: "en", name: "English", isActive: 1 },
      { code: "sw", name: "Swahili", isActive: 1 },
      { code: "xh", name: "Xhosa", isActive: 1 },
      { code: "zu", name: "Zulu", isActive: 1 },
      { code: "yo", name: "Yoruba", isActive: 1 }
    ];

    console.log("Adding languages...");
    const languageIds = {};
    
    for (const lang of languageData) {
      const [newLang] = await db.insert(languages)
        .values({
          code: lang.code,
          name: lang.name,
          isActive: lang.isActive,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        .returning({ id: languages.id });
      
      languageIds[lang.code] = newLang.id;
    }

    // Seed demo user if not exists
    console.log("Adding demo user...");
    let demoUserId;
    
    const existingUser = await db.select({ id: users.id })
      .from(users)
      .where(eq(users.email, "demo@example.com"))
      .limit(1);
    
    if (existingUser && existingUser.length > 0) {
      demoUserId = existingUser[0].id;
    } else {
      const [newUser] = await db.insert(users)
        .values({
          firstname: "Demo",
          lastname: "User",
          email: "demo@example.com",
          password: "$2b$10$DemoHashedPasswordForDemoUserOnly12345", // Never use in production
          activated: 1,
          verified: 1,
          isAdmin: 0,
          userStatus: 0,
          logins: 1,
          signupDate: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        })
        .returning({ id: users.id });
      
      demoUserId = newUser.id;
    }

    // Seed cultural tags
    console.log("Adding cultural tags...");
    const tagData = [
      { name: "Ubuntu", description: "The African philosophy of community and interconnectedness", category: "philosophy" },
      { name: "Anansi", description: "West African trickster spider character", category: "character" },
      { name: "Griots", description: "West African storytellers and oral historians", category: "tradition" },
      { name: "Mwindo Epic", description: "Central African heroic epic", category: "story" },
      { name: "Yoruba", description: "West African ethnic group and culture", category: "culture" },
      { name: "Zulu", description: "South African ethnic group and culture", category: "culture" },
      { name: "Masai", description: "East African ethnic group and culture", category: "culture" },
      { name: "Coming of Age", description: "Stories about transition to adulthood", category: "theme" },
      { name: "Animal Tales", description: "Stories featuring animals as characters", category: "genre" },
      { name: "Creation Myths", description: "Stories explaining origins of the world", category: "genre" }
    ];
    
    const tagIds = {};
    
    for (const tag of tagData) {
      const [newTag] = await db.insert(culturalTags)
        .values({
          name: tag.name,
          description: tag.description,
          category: tag.category,
          createdAt: new Date().toISOString()
        })
        .returning({ id: culturalTags.id });
      
      tagIds[tag.name] = newTag.id;
    }

    // Seed stories
    console.log("Adding sample stories...");
    const storyData = [
      {
        title: "Why the Sky is Far Away",
        content: `Long ago, the sky was close to the Earth, and people could reach up and break off pieces to eat. The sky was made of food, and whenever anyone was hungry, they simply reached up and broke off a piece of the sky.

        But people became wasteful. They took more than they needed, and they threw away what they did not eat. The sky grew angry at this wastefulness.

        "If you cannot appreciate my gifts," said the sky, "then you shall not have them so easily."

        And with that, the sky moved far away, where people could no longer reach it. That is why today we must work hard to grow our food from the earth, and why we are taught not to waste what we are given.`,
        languageCode: "en",
        tags: ["Creation Myths", "Yoruba"],
        description: "A Yoruba folktale explaining why the sky is far from Earth."
      },
      {
        title: "The Tortoise and the Birds",
        content: `Once upon a time, the birds were invited to a feast in the sky. Tortoise heard about the feast and wanted to join, but he had no wings. So he went to the birds and begged them each to give him a feather.

        "I will create wings from your feathers," he said, "and then I can fly with you to the feast."
        
        The birds felt sorry for Tortoise and each gave him a feather. With these, Tortoise made a pair of beautiful wings.

        As they were flying to the feast, Tortoise suggested that they should each take a new name for the feast, as was the custom. The birds agreed and chose their names.

        "I will be called 'All of You,'" said Tortoise.

        When they arrived at the feast, their host welcomed them and laid out the food, saying, "This feast is for All of You."

        Tortoise stepped forward and claimed, "That is my name. The food is for me."

        He took all the food before the birds could eat. The birds were very angry. On the journey home, they each took back their feathers, leaving Tortoise with no way to fly.

        Tortoise fell from the sky and his shell broke into many pieces. The medicine man put his shell back together, which is why the tortoise's shell looks like a patched-up thing to this day.`,
        languageCode: "en",
        tags: ["Animal Tales", "Anansi"],
        description: "An Igbo folktale about the consequences of greed and trickery."
      },
      {
        title: "The Lion's Whisker",
        content: `There once was a woman who married a man who had a son from a previous marriage. She wanted the boy to love her, but he was still sad about his mother's death and wouldn't warm up to his stepmother.

        The woman went to a wise elder in her village for help. "I want my stepson to love me," she said. "Can you give me a magic potion to put in his food?"

        The elder thought for a moment, then said, "I can help you, but first you must bring me a whisker from a living lion."

        The woman was scared but determined. For many days, she went to where a lion lived and brought it food, staying a bit longer each time. After many weeks, the lion grew comfortable with her presence. Finally, one day, she was able to reach out and pluck a whisker from the lion's face.

        Triumphantly, she brought the whisker to the elder.

        "Now," she said, "please give me the magic potion."

        The elder took the whisker, looked at it briefly, then threw it into the fire.

        "What are you doing?" cried the woman. "I risked my life for that!"

        "You don't need a magic potion," said the elder. "You had the patience and courage to gain the trust of a lion. Use that same patience and courage with your stepson, and in time, he too will come to love you."`,
        languageCode: "en",
        tags: ["Coming of Age", "Ubuntu"],
        description: "An Ethiopian folktale about patience and earning trust."
      }
    ];
    
    const storyIds = [];
    
    for (const story of storyData) {
      // Get language ID
      const langId = languageIds[story.languageCode];
      
      // Create story
      const [newStory] = await db.insert(stories)
        .values({
          userId: demoUserId,
          title: story.title,
          originalContent: story.content,
          originalLanguageId: langId,
          description: story.description,
          isPublic: 1,
          views: Math.floor(Math.random() * 100),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        .returning({ id: stories.id });
      
      storyIds.push(newStory.id);
      
      // Add tags
      for (const tagName of story.tags) {
        await db.insert(storyTags)
          .values({
            storyId: newStory.id,
            tagId: tagIds[tagName],
            createdAt: new Date().toISOString()
          });
      }
      
      // Create a sample completed comic for the first story
      if (storyIds.length === 1) {
        // Create comic entry
        const [newComic] = await db.insert(comics)
          .values({
            storyId: newStory.id,
            title: `Comic: ${story.title}`,
            description: `A comic adaptation of "${story.title}"`,
            panelCount: 3,
            status: "completed",
            generationPrompt: "Create a comic adaptation of this traditional African folktale.",
            views: Math.floor(Math.random() * 50),
            likes: Math.floor(Math.random() * 20),
            shares: Math.floor(Math.random() * 10),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          })
          .returning({ id: comics.id });
        
        // Add placeholder panels
        const panelData = [
          {
            panelNumber: 1,
            imageUrl: "https://placehold.co/600x400?text=Panel+1:+Long+ago,+the+sky+was+close+to+Earth",
            caption: "Long ago, the sky was close to the Earth, and people could reach up and break off pieces to eat.",
            altText: "Illustration showing people reaching up to the sky for food"
          },
          {
            panelNumber: 2,
            imageUrl: "https://placehold.co/600x400?text=Panel+2:+People+became+wasteful",
            caption: "But people became wasteful, taking more than they needed.",
            altText: "Illustration of people wasting sky-food"
          },
          {
            panelNumber: 3,
            imageUrl: "https://placehold.co/600x400?text=Panel+3:+The+sky+moved+away",
            caption: "The sky grew angry and moved far away, where people could no longer reach it.",
            altText: "Illustration of the sky moving far away from Earth"
          }
        ];
        
        for (const panel of panelData) {
          await db.insert(comicPanels)
            .values({
              comicId: newComic.id,
              panelNumber: panel.panelNumber,
              imageUrl: panel.imageUrl,
              caption: panel.caption,
              altText: panel.altText,
              createdAt: new Date().toISOString()
            });
        }
      }
    }

    console.log("Demo data seeded successfully!");
    return { success: true };
  } catch (error) {
    console.error("Error seeding demo data:", error);
    throw error;
  }
} 