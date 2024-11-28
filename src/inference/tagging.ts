import { SMTPEmail } from "../types/mailTypes";
import { getOpenAIJsonResponse, userPrompt } from "../utils/openai";

const TOPIC_TAGS = [
  "Speaker Event",
  "Internship",
  "Eating Club",
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

const getRuleBasedTags = (data: SMTPEmail) => {
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

  return ruleTags;
};

const getTopicTags = async (data: SMTPEmail) => {
  const classifyTagsPrompt = userPrompt((tags: string[]) => ``); // TODO: needs prompt

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

export const getTags = async (data: SMTPEmail) => {
  const ruleTags = getRuleBasedTags(data);
  const topicTags = await getTopicTags(data);
  return Array.from(new Set([...ruleTags, ...topicTags]));
};
