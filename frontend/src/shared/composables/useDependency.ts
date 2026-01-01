import { inject } from 'vue';
import { Container } from 'inversify';

export function useDependency<T>(key: symbol): T {
    const container = inject<Container>('di-container');
    if (!container) {
        throw new Error('DI Container not provided!');
    }
    return container.get<T>(key);
}
