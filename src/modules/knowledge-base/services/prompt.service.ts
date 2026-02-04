import { Injectable, NotFoundException } from '@nestjs/common';
import { PromptStrategy } from '../domain/interfaces/prompt-strategy.interface';
import { DefaultRuleExtractionStrategy } from './prompts/default-rule-extraction.strategy';

@Injectable()
export class PromptService {
    private strategies: Map<string, PromptStrategy> = new Map();

    constructor() {
        // Register default strategies
        this.registerStrategy(new DefaultRuleExtractionStrategy());
    }

    registerStrategy(strategy: PromptStrategy) {
        this.strategies.set(strategy.name, strategy);
    }

    getStrategy(name: string): PromptStrategy {
        const strategy = this.strategies.get(name);
        if (!strategy) {
            // Fallback to default if not found
            // In a real scenario, could throw error or return default
            const defaultStrategy = this.strategies.get('DEFAULT_EXTRACTION');
            if (defaultStrategy) return defaultStrategy;

            // ERR-001: Use NotFoundException instead of generic Error
            throw new NotFoundException(`Strategy ${name} not found and no default available`);
        }
        return strategy;
    }
}
