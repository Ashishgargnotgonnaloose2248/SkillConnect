import { User } from "../models/User.model.js";
import { Skill } from "../models/Skill.model.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";

//
// 🔍 FIND SKILL EXCHANGE OPPORTUNITIES FOR CURRENT USER
//
export const findSkillMatches = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { page = 1, limit = 10, category } = req.query;

  // Get current user's skills
  const currentUser = await User.findById(userId)
    .populate("skillsOffered", "name category")
    .populate("skillsSeeking", "name category");

  if (!currentUser) {
    throw new ApiError(404, "User not found");
  }

  const userOfferedSkills = currentUser.skillsOffered.map(skill => skill._id.toString());
  const userSeekingSkills = currentUser.skillsSeeking.map(skill => skill._id.toString());

  // Find potential matches
  const matches = [];

  // 1. Find users who want to learn skills I can teach
  const teachingOpportunities = await User.find({
    _id: { $ne: userId }, // Exclude current user
    skillsSeeking: { $in: userOfferedSkills }, // They seek skills I offer
  })
    .populate("skillsOffered", "name category")
    .populate("skillsSeeking", "name category")
    .select("-password -__v");

  // Process teaching opportunities
  for (const user of teachingOpportunities) {
    const commonSkills = user.skillsSeeking.filter(skill => 
      userOfferedSkills.includes(skill._id.toString())
    );
    
    matches.push({
      user: user,
      matchType: "teaching_opportunity",
      commonSkills: commonSkills,
      compatibilityScore: calculateCompatibilityScore(currentUser, user, "teaching"),
    });
  }

  // 2. Find users who can teach skills I want to learn
  const learningOpportunities = await User.find({
    _id: { $ne: userId }, // Exclude current user
    skillsOffered: { $in: userSeekingSkills }, // They offer skills I seek
  })
    .populate("skillsOffered", "name category")
    .populate("skillsSeeking", "name category")
    .select("-password -__v");

  // Process learning opportunities
  for (const user of learningOpportunities) {
    const commonSkills = user.skillsOffered.filter(skill => 
      userSeekingSkills.includes(skill._id.toString())
    );
    
    matches.push({
      user: user,
      matchType: "learning_opportunity",
      commonSkills: commonSkills,
      compatibilityScore: calculateCompatibilityScore(currentUser, user, "learning"),
    });
  }

  // 3. Find mutual skill exchange opportunities
  const mutualExchanges = await User.find({
    _id: { $ne: userId },
    skillsOffered: { $in: userSeekingSkills },
    skillsSeeking: { $in: userOfferedSkills },
  })
    .populate("skillsOffered", "name category")
    .populate("skillsSeeking", "name category")
    .select("-password -__v");

  // Process mutual exchanges
  for (const user of mutualExchanges) {
    const skillsICanTeach = user.skillsSeeking.filter(skill => 
      userOfferedSkills.includes(skill._id.toString())
    );
    const skillsIWantToLearn = user.skillsOffered.filter(skill => 
      userSeekingSkills.includes(skill._id.toString())
    );
    
    matches.push({
      user: user,
      matchType: "mutual_exchange",
      skillsICanTeach: skillsICanTeach,
      skillsIWantToLearn: skillsIWantToLearn,
      compatibilityScore: calculateCompatibilityScore(currentUser, user, "mutual"),
    });
  }

  // Filter by category if specified
  let filteredMatches = matches;
  if (category) {
    filteredMatches = matches.filter(match => {
      const skills = match.commonSkills || match.skillsICanTeach || match.skillsIWantToLearn || [];
      return skills.some(skill => skill.category === category);
    });
  }

  // Sort by compatibility score (highest first)
  filteredMatches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const paginatedMatches = filteredMatches.slice(skip, skip + parseInt(limit));

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        matches: paginatedMatches,
        totalMatches: filteredMatches.length,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(filteredMatches.length / parseInt(limit)),
          hasNext: skip + paginatedMatches.length < filteredMatches.length,
          hasPrev: parseInt(page) > 1,
        },
        userSkills: {
          offered: currentUser.skillsOffered,
          seeking: currentUser.skillsSeeking,
        },
      },
      "Skill matches found successfully"
    )
  );
});

//
// 🎯 FIND SPECIFIC SKILL EXCHANGE PARTNERS
//
export const findSkillPartners = asyncHandler(async (req, res) => {
  const { skillId } = req.params;
  const { matchType = "all", page = 1, limit = 10 } = req.query;
  const userId = req.user._id;

  // Check if skill exists
  const skill = await Skill.findById(skillId);
  if (!skill) {
    throw new ApiError(404, "Skill not found");
  }

  let partners = [];

  if (matchType === "teachers" || matchType === "all") {
    // Find users who can teach this skill
    const teachers = await User.find({
      _id: { $ne: userId },
      skillsOffered: skillId,
    })
      .populate("skillsOffered", "name category")
      .populate("skillsSeeking", "name category")
      .select("-password -__v");

    teachers.forEach(teacher => {
      partners.push({
        user: teacher,
        matchType: "teacher",
        skill: skill,
      });
    });
  }

  if (matchType === "learners" || matchType === "all") {
    // Find users who want to learn this skill
    const learners = await User.find({
      _id: { $ne: userId },
      skillsSeeking: skillId,
    })
      .populate("skillsOffered", "name category")
      .populate("skillsSeeking", "name category")
      .select("-password -__v");

    learners.forEach(learner => {
      partners.push({
        user: learner,
        matchType: "learner",
        skill: skill,
      });
    });
  }

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const paginatedPartners = partners.slice(skip, skip + parseInt(limit));

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        skill: skill,
        partners: paginatedPartners,
        totalPartners: partners.length,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(partners.length / parseInt(limit)),
          hasNext: skip + paginatedPartners.length < partners.length,
          hasPrev: parseInt(page) > 1,
        },
      },
      "Skill partners found successfully"
    )
  );
});

//
// 📊 GET MATCHING STATISTICS
//
export const getMatchingStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const currentUser = await User.findById(userId)
    .populate("skillsOffered", "name category")
    .populate("skillsSeeking", "name category");

  if (!currentUser) {
    throw new ApiError(404, "User not found");
  }

  const userOfferedSkills = currentUser.skillsOffered.map(skill => skill._id.toString());
  const userSeekingSkills = currentUser.skillsSeeking.map(skill => skill._id.toString());

  // Count potential matches
  const teachingCount = await User.countDocuments({
    _id: { $ne: userId },
    skillsSeeking: { $in: userOfferedSkills },
  });

  const learningCount = await User.countDocuments({
    _id: { $ne: userId },
    skillsOffered: { $in: userSeekingSkills },
  });

  const mutualCount = await User.countDocuments({
    _id: { $ne: userId },
    skillsOffered: { $in: userSeekingSkills },
    skillsSeeking: { $in: userOfferedSkills },
  });

  // Get skill categories breakdown
  const offeredCategories = {};
  const seekingCategories = {};

  currentUser.skillsOffered.forEach(skill => {
    offeredCategories[skill.category] = (offeredCategories[skill.category] || 0) + 1;
  });

  currentUser.skillsSeeking.forEach(skill => {
    seekingCategories[skill.category] = (seekingCategories[skill.category] || 0) + 1;
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        userStats: {
          offeredSkills: currentUser.skillsOffered.length,
          seekingSkills: currentUser.skillsSeeking.length,
        },
        matchingOpportunities: {
          teachingOpportunities: teachingCount,
          learningOpportunities: learningCount,
          mutualExchanges: mutualCount,
          totalOpportunities: teachingCount + learningCount + mutualCount,
        },
        skillCategories: {
          offered: offeredCategories,
          seeking: seekingCategories,
        },
      },
      "Matching statistics retrieved successfully"
    )
  );
});

//
// 🔧 HELPER FUNCTION: Calculate Compatibility Score
//
function calculateCompatibilityScore(user1, user2, matchType) {
  let score = 0;

  // Base score for having matching skills
  const user1Offered = user1.skillsOffered.map(s => s._id.toString());
  const user1Seeking = user1.skillsSeeking.map(s => s._id.toString());
  const user2Offered = user2.skillsOffered.map(s => s._id.toString());
  const user2Seeking = user2.skillsSeeking.map(s => s._id.toString());

  if (matchType === "teaching") {
    // Higher score for more skills I can teach that they want to learn
    const commonSkills = user2Seeking.filter(skillId => user1Offered.includes(skillId));
    score = commonSkills.length * 20;
  } else if (matchType === "learning") {
    // Higher score for more skills they can teach that I want to learn
    const commonSkills = user1Seeking.filter(skillId => user2Offered.includes(skillId));
    score = commonSkills.length * 20;
  } else if (matchType === "mutual") {
    // Highest score for mutual exchange opportunities
    const skillsICanTeach = user2Seeking.filter(skillId => user1Offered.includes(skillId));
    const skillsIWantToLearn = user1Seeking.filter(skillId => user2Offered.includes(skillId));
    score = (skillsICanTeach.length + skillsIWantToLearn.length) * 25;
  }

  // Bonus for similar role (students prefer other students, faculty prefer faculty)
  if (user1.role === user2.role) {
    score += 10;
  }

  // Bonus for having complementary skills
  const totalSkills = user1Offered.length + user1Seeking.length + user2Offered.length + user2Seeking.length;
  if (totalSkills > 0) {
    const diversityBonus = Math.min(15, (totalSkills / 4) * 2);
    score += diversityBonus;
  }

  return Math.round(score);
}
