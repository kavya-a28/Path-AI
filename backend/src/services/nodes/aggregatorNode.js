const { extractDomains } = require('./routerNode');
const { generateLogisticsQuestions } = require('./logisticsNode');
const { generateDomainQuestions } = require('./domainNode');

async function buildQuestionQueue(userText) {
  try {
    // 1. Router Node: Extract Domains
    const domains = await extractDomains(userText);
    
    // 2. Parallel Generation: Logistics + All Domain Nodes
    const tasks = [];
    
    // Task A: Logistics (Global Constraints)
    tasks.push(generateLogisticsQuestions(userText));
    
    // Tasks B..N: Domain Specifics
    for (const domain of domains) {
      tasks.push(generateDomainQuestions(domain, userText));
    }
    
    // Wait for all nodes to finish
    const results = await Promise.all(tasks);
    
    // 3. Aggregator: Compile and Format
    const logisticsQuestions = results[0];
    const domainQuestionsArrays = results.slice(1);
    
    const finalQueue = [];
    
    // Format logistics
    for (const q of logisticsQuestions) {
      finalQueue.push({
        field: q.field,
        domain: 'general',
        text: q.text,
        suggestedReplies: q.options || ["Yes", "No", "Tell me more"]
      });
    }
    
    // We can either append domain questions sequentially (Domain 1, then Domain 2)
    // Or interleave them (Round robin: Domain 1 Q1, Domain 2 Q1...)
    // Let's interleave them for equal distribution!
    
    const maxQuestions = Math.max(...domainQuestionsArrays.map(arr => arr.length));
    
    for (let i = 0; i < maxQuestions; i++) {
      for (const domainQs of domainQuestionsArrays) {
        if (domainQs[i]) {
          finalQueue.push({
            field: domainQs[i].field,
            domain: domainQs[i].domain,
            text: domainQs[i].text,
            suggestedReplies: domainQs[i].options || ["Yes", "No", "Tell me more"]
          });
        }
      }
    }
    
    return { domains, queue: finalQueue };
  } catch (error) {
    console.error("Aggregator Node Error:", error);
    // Ultimate fallback
    return {
      domains: ['web_development'],
      queue: [
        { field: 'primaryGoal', domain: 'general', text: 'What is your main goal?', suggestedReplies: ['Job', 'Projects', 'Freelance'] },
        { field: 'timeCommitment', domain: 'general', text: 'How much time can you commit?', suggestedReplies: ['5 hrs/week', '10 hrs/week', '20 hrs/week'] }
      ]
    };
  }
}

module.exports = { buildQuestionQueue };
