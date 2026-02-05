import { Test, TestingModule } from '@nestjs/testing';
import { AssetsController } from './assets.controller';
import {
    CreateAssetUseCase,
    FindAssetUseCase,
    FindAssetByTickerUseCase,
    ListAssetsUseCase,
    UpdateAssetUseCase,
    UpdateIndicatorsUseCase,
    DeleteAssetUseCase,
} from '../../application/use-cases';
import { JwtAuthGuard } from '../../../auth';

describe('AssetsController', () => {
    let controller: AssetsController;
    let createAssetUseCase: jest.Mocked<CreateAssetUseCase>;
    let findAssetUseCase: jest.Mocked<FindAssetUseCase>;
    let findAssetByTickerUseCase: jest.Mocked<FindAssetByTickerUseCase>;
    let listAssetsUseCase: jest.Mocked<ListAssetsUseCase>;
    let updateAssetUseCase: jest.Mocked<UpdateAssetUseCase>;
    let updateIndicatorsUseCase: jest.Mocked<UpdateIndicatorsUseCase>;
    let deleteAssetUseCase: jest.Mocked<DeleteAssetUseCase>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AssetsController],
            providers: [
                {
                    provide: CreateAssetUseCase,
                    useValue: { execute: jest.fn() },
                },
                {
                    provide: FindAssetUseCase,
                    useValue: { execute: jest.fn() },
                },
                {
                    provide: FindAssetByTickerUseCase,
                    useValue: { execute: jest.fn() },
                },
                {
                    provide: ListAssetsUseCase,
                    useValue: { execute: jest.fn() },
                },
                {
                    provide: UpdateAssetUseCase,
                    useValue: { execute: jest.fn() },
                },
                {
                    provide: UpdateIndicatorsUseCase,
                    useValue: { execute: jest.fn() },
                },
                {
                    provide: DeleteAssetUseCase,
                    useValue: { execute: jest.fn() },
                },
            ],
        })
            .overrideGuard(JwtAuthGuard)
            .useValue({ canActivate: jest.fn(() => true) })
            .compile();

        controller = module.get<AssetsController>(AssetsController);
        createAssetUseCase = module.get(CreateAssetUseCase);
        findAssetUseCase = module.get(FindAssetUseCase);
        findAssetByTickerUseCase = module.get(FindAssetByTickerUseCase);
        listAssetsUseCase = module.get(ListAssetsUseCase);
        updateAssetUseCase = module.get(UpdateAssetUseCase);
        updateIndicatorsUseCase = module.get(UpdateIndicatorsUseCase);
        deleteAssetUseCase = module.get(DeleteAssetUseCase);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should call CreateAssetUseCase', async () => {
            const input = { ticker: 'AAPL', name: 'Apple', type: 'STOCK', sector: 'Tech' };
            const output = { id: '1', ...input, createdAt: new Date() };
            createAssetUseCase.execute.mockResolvedValue(output as any);

            const result = await controller.create(input as any);

            expect(createAssetUseCase.execute).toHaveBeenCalledWith(input);
            expect(result).toEqual({ data: output });
        });
    });

    describe('list', () => {
        it('should call ListAssetsUseCase with params', async () => {
            const output = { data: [], meta: { total: 0, page: 1, lastPage: 1 } };
            listAssetsUseCase.execute.mockResolvedValue(output as any);

            await controller.list('1', '10', 'STOCK', 'Tech');

            expect(listAssetsUseCase.execute).toHaveBeenCalledWith({
                page: 1,
                perPage: 10,
                type: 'STOCK',
                sector: 'Tech',
            });
        });
    });

    describe('findByTicker', () => {
        it('should call FindAssetByTickerUseCase', async () => {
            const ticker = 'AAPL';
            const output = { id: '1', ticker };
            findAssetByTickerUseCase.execute.mockResolvedValue(output as any);

            const result = await controller.findByTicker(ticker);

            expect(findAssetByTickerUseCase.execute).toHaveBeenCalledWith(ticker);
            expect(result).toEqual({ data: output });
        });
    });

    describe('findOne', () => {
        it('should call FindAssetUseCase', async () => {
            const id = 'uuid';
            const output = { id, ticker: 'AAPL' };
            findAssetUseCase.execute.mockResolvedValue(output as any);

            const result = await controller.findOne(id);

            expect(findAssetUseCase.execute).toHaveBeenCalledWith(id);
            expect(result).toEqual({ data: output });
        });
    });

    describe('update', () => {
        it('should call UpdateAssetUseCase', async () => {
            const id = 'uuid';
            const input = { name: 'Apple Inc.' };
            const user = { id: 'user-id' };
            const output = { id, ticker: 'AAPL', ...input };
            updateAssetUseCase.execute.mockResolvedValue(output as any);

            const result = await controller.update(id, input as any, user);

            expect(updateAssetUseCase.execute).toHaveBeenCalledWith(id, input);
            expect(result).toEqual({ data: output });
        });
    });

    describe('updateIndicators', () => {
        it('should call UpdateIndicatorsUseCase', async () => {
            const id = 'uuid';
            const input = { price: 150 };
            const user = { id: 'user-id' };
            const output = { id, ticker: 'AAPL', ...input };
            updateIndicatorsUseCase.execute.mockResolvedValue(output as any);

            const result = await controller.updateIndicators(id, input as any, user);

            expect(updateIndicatorsUseCase.execute).toHaveBeenCalledWith(id, input);
            expect(result).toEqual({ data: output });
        });
    });

    describe('delete', () => {
        it('should call DeleteAssetUseCase', async () => {
            const id = 'uuid';
            const user = { id: 'user-id' };

            await controller.delete(id, user);

            expect(deleteAssetUseCase.execute).toHaveBeenCalledWith(id);
        });
    });
});
