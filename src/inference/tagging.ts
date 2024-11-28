import { SMTPEmail } from "../types/mailTypes";

const RULE_BASED_TAGS = [
  "Free Food",
  "All Undergrad",
  "WhitmanWire",
  "MatheyMail",
  "Pace Center",
  "CampusRec",
  "TigerAlert",
  "Google Slides",
];

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

const getRuleBasedTags = (data: SMTPEmail) => {
  return [RULE_BASED_TAGS[0]];
};

const getTopicTags = async (data: SMTPEmail) => {
  return [TOPIC_TAGS[0]];
};

export const getTags = async (data: SMTPEmail) => {
  const ruleTags = getRuleBasedTags(data);
  const topicTags = await getTopicTags(data);
  return [...ruleTags, ...topicTags];
};
