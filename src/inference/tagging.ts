import { SMTPEmail } from "../types/mailTypes";
import { getOpenAIJsonResponse, userPrompt } from "../utils/openai";

const TOPIC_TAGS = [
  "Speaker Event",
  "Internship",
  "Tower Club",
  "Cap and Gown Club",
  "Boba",
  "RSVP",
  "Lost & Found",
  "Club Meeting",
  "Religion",
  "Politics",
  "Sale",
];

const TAG_BATCH_SIZE = 32;

type TagsDict = {
  [key: string]: boolean;
};

const getRuleBasedTags = (data: SMTPEmail, topicTags: string[]) => {
  const ruleTags: string[] = [];
  const toAddresses = data.envelopeTo.map((value) => value.address);

  // const RULE_BASED_TAGS = [
  //   "Free Food",
  //   "All Undergrad",
  //   "WhitmanWire",
  //   "MatheyMail",
  //   "Pace Center",
  //   "CampusRec",
  //   "TigerAlert",
  //   "Google Slides",
  // ];

  if (toAddresses.includes("freefood@princeton.edu")) {
    ruleTags.push("Free Food");
  }

  if (topicTags.includes("Tower Club")) {
    ruleTags.push("Eating Club");
  }

  return ruleTags;
};

const getTopicTags = async (parsedText: string) => {
  const classifyTagsPrompt = userPrompt(
    (tags: string[]) =>
      `Here is the parsed content of an email: ${parsedText}

  Return a JSON with the following keys: ${tags.join(", ")}.
  Each key represents a tag that the email could be tagged with.
  The value for each key should be a boolean true if the email relates to that key/tag.
  Otherwise return value as false.`
  );

  const promises: Promise<TagsDict | null>[] = [];
  for (let i = 0; i < TOPIC_TAGS.length; i += TAG_BATCH_SIZE) {
    const topicTagsBatch = TOPIC_TAGS.slice(i, i + TAG_BATCH_SIZE);
    promises.push(
      getOpenAIJsonResponse<TagsDict>([classifyTagsPrompt(topicTagsBatch)])
    );
  }

  const results = await Promise.all(promises);
  // if (results.includes(null)) {
  //   throw new Error("null result from OpenAI JSON response in getTopicTags");
  // }

  const tags = results
    .filter((result: TagsDict | null) => result !== null)
    .map((result: TagsDict) => getTagsWithTrue(result));

  return tags.reduce((a: string[], b: string[]) => [...a, ...b]);
};

const getTagsWithTrue = (tagsDict: TagsDict) => {
  return Object.entries(tagsDict)
    .filter(([key, value]) => value === true)
    .map(([key]) => key);
};

export const getTags = async (data: SMTPEmail, parsedText: string) => {
  const topicTags = await getTopicTags(parsedText);
  const ruleTags = getRuleBasedTags(data, topicTags);
  return Array.from(new Set([...ruleTags, ...topicTags]));
};
