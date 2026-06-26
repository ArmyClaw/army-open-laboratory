#!/usr/bin/env python3
"""
多代进化，收敛到高分旋律 - 实现完整的进化迭代功能
"""

import sys
import os
import json
import time
from datetime import datetime
from typing import List, Dict, Optional
import random

sys.path.append(os.path.join(os.path.dirname(__file__), '.'))

from evo_music.genetic_algorithm import (
    GeneticAlgorithmEngine, MelodyIndividual, SelectionType, CrossoverType
)
from evo_music.melody import MelodyConfig, EmotionType, MelodyState
from evo_music.fitness import MelodyFitnessEvaluator
from evo_music.scales import ScaleType, ScaleFactory
from evo_music.notes import NoteName


class MelodyEvolutionOptimizer:
    """旋律进化优化器 - 专门实现多代进化收敛功能"""
    
    def __init__(self):
        self.evolution_history = []
        self.best_melody_ever = None
        self.best_fitness_ever = 0.0
        
    def create_enhanced_initial_population(self, config: MelodyConfig, 
                                         population_size: int = 50) -> List[MelodyIndividual]:
        """创建增强的初始种群 - 确保足够的多样性"""
        print(f"创建增强初始种群: {population_size} 个个体")
        
        population = []
        random_seeds = range(population_size)  # 使用不同种子确保多样性
        
        for i, seed in enumerate(random_seeds):
            random.seed(seed + 1000)  # 确保不同种子有足够的差异
            
            # 基于情感类型生成不同特征的旋律
            if config.emotion == EmotionType.HAPPY:
                # 快速、明亮的旋律
                melody_states = self._create_happy_melody(config, i)
            elif config.emotion == EmotionType.SAD:
                # 缓慢、柔和的旋律
                melody_states = self._create_sad_melody(config, i)
            elif config.emotion == EmotionType.MYSTERIOUS:
                # 不规则、神秘的旋律
                melody_states = self._create_mysterious_melody(config, i)
            else:
                # 中性旋律
                melody_states = self._create_neutral_melody(config, i)
            
            individual = MelodyIndividual(
                melody_states=melody_states,
                generation=0,
                parent_ids=(0, 0)
            )
            population.append(individual)
        
        # 评估初始种群
        evaluator = MelodyFitnessEvaluator(config.scale)
        for individual in population:
            individual.fitness = individual.calculate_fitness(evaluator)
        
        # 初始化最佳个体
        self.best_melody_ever = max(population, key=lambda ind: ind.fitness)
        self.best_fitness_ever = self.best_melody_ever.fitness
        
        print(f"初始种群最佳适应度: {self.best_fitness_ever:.4f}")
        return population
    
    def _create_happy_melody(self, config: MelodyConfig, variation: int) -> List[MelodyState]:
        """创建快乐情感的旋律"""
        states = []
        
        # 快速节奏，明亮音色
        base_duration = 0.25
        base_velocity = 90
        base_octave = 4
        
        for i in range(config.length):
            # 在大调音阶中选择音符
            scale_notes = config.scale.get_notes()
            
            # 添加音程变化模式
            if i % 4 == 0:  # 每小节第一个音符
                note = random.choice([scale_notes[0], scale_notes[2], scale_notes[4]])  # 主音、三音、五音
            elif i % 4 == 2:  # 小节中点
                note = random.choice([scale_notes[1], scale_notes[3]])  # 二音、四音
            else:
                note = random.choice(scale_notes)
            
            # 八度变化
            octave_variation = variation % 3  # 0,1,2
            if octave_variation == 0:
                octave = base_octave
            elif octave_variation == 1:
                octave = base_octave + 1
            else:
                octave = base_octave - 1
            
            # 时值变化
            duration_multiplier = 1.0 + (variation % 5) * 0.1  # 1.0 到 1.4
            duration = base_duration * duration_multiplier
            
            state = MelodyState(
                note=note,
                octave=octave,
                duration=duration,
                velocity=base_velocity + (variation % 3) * 10,
                time_position=i * 0.25
            )
            states.append(state)
        
        return states
    
    def _create_sad_melody(self, config: MelodyConfig, variation: int) -> List[MelodyState]:
        """创建悲伤情感的旋律"""
        states = []
        
        # 缓慢节奏，柔和音色
        base_duration = 0.5
        base_velocity = 60
        base_octave = 3
        
        for i in range(config.length):
            # 在大调音阶中选择偏向悲伤的音符
            scale_notes = config.scale.get_notes()
            
            # 偏向小调音程（六度、七度）
            if i % 4 == 0:  # 小节开始
                note = random.choice([scale_notes[0], scale_notes[3]])  # 主音、下属音
            else:
                # 倾向于低音区
                note = random.choice(scale_notes[:4])
            
            # 八度保持在低音区
            octave = base_octave + (variation % 2)  # 3或4
            
            # 时值较长
            duration = base_duration * (1.5 + (variation % 3) * 0.25)
            
            state = MelodyState(
                note=note,
                octave=octave,
                duration=duration,
                velocity=base_velocity + (variation % 2) * 10,
                time_position=i * 0.25
            )
            states.append(state)
        
        return states
    
    def _create_mysterious_melody(self, config: MelodyConfig, variation: int) -> List[MelodyState]:
        """创建神秘情感的旋律"""
        states = []
        
        # 不规则节奏，中等力度
        base_duration = random.choice([0.125, 0.25, 0.5])
        base_velocity = 70
        base_octave = random.randint(3, 5)
        
        for i in range(config.length):
            # 使用半音阶以增加神秘感
            all_notes = [NoteName.C, NoteName.CS, NoteName.D, NoteName.DS, NoteName.E, 
                        NoteName.F, NoteName.FS, NoteName.G, NoteName.GS, NoteName.A, 
                        NoteName.AS, NoteName.B]
            
            # 偶尔使用变化音
            if random.random() < 0.3:
                note = random.choice(all_notes)
            else:
                note = random.choice(config.scale.get_notes())
            
            # 八度变化较大
            octave = base_octave + (variation % 5) - 2  # 1-4的范围
            
            # 不规则的时值
            duration = base_duration * random.choice([0.5, 1.0, 1.5, 2.0])
            
            state = MelodyState(
                note=note,
                octave=octave,
                duration=duration,
                velocity=base_velocity + (variation % 4) * 15,
                time_position=i * 0.25
            )
            states.append(state)
        
        return states
    
    def _create_neutral_melody(self, config: MelodyConfig, variation: int) -> List[MelodyState]:
        """创建中性情感的旋律"""
        states = []
        
        # 中等节奏，标准力度
        base_duration = 0.25
        base_velocity = 80
        base_octave = 4
        
        for i in range(config.length):
            # 在音阶内均匀选择
            scale_notes = config.scale.get_notes()
            note = random.choice(scale_notes)
            
            # 八度正常变化
            octave = base_octave + (variation % 3) - 1  # 3-5的范围
            
            # 时值适中变化
            duration = base_duration * random.choice([0.5, 1.0, 1.5, 2.0])
            
            state = MelodyState(
                note=note,
                octave=octave,
                duration=duration,
                velocity=base_velocity + (variation % 5) * 10,
                time_position=i * 0.25
            )
            states.append(state)
        
        return states
    
    def run_multi_generation_evolution(self, config: MelodyConfig, 
                                     generations: int = 100,
                                     population_size: int = 50) -> MelodyIndividual:
        """运行多代进化，收敛到高分旋律"""
        print("=" * 60)
        print("🧬 开始多代进化旋律")
        print("=" * 60)
        print(f"配置: 情感={config.emotion.value}, 长度={config.length}, 代数={generations}")
        print(f"种群大小: {population_size}")
        print("=" * 60)
        
        # 创建遗传算法引擎
        ga_engine = GeneticAlgorithmEngine(
            population_size=population_size,
            generations=generations,
            elite_ratio=0.1,    # 10%精英保留
            mutation_rate=0.15,  # 15%变异率
            selection_type=SelectionType.TOURNAMENT,
            crossover_type=CrossoverType.SINGLE_POINT
        )
        
        # 创建评估器
        evaluator = MelodyFitnessEvaluator(config.scale)
        
        # 创建初始种群
        population = self.create_enhanced_initial_population(config, population_size)
        
        # 进化主循环
        stagnation_counter = 0
        last_best_fitness = self.best_fitness_ever
        
        print(f"\\n🎯 开始进化过程...")
        
        for generation in range(generations):
            # 进化一代
            population = ga_engine.evolve_population(population, evaluator, config)
            
            # 更新最佳个体
            current_best = max(population, key=lambda ind: ind.fitness)
            if current_best.fitness > self.best_fitness_ever:
                self.best_melody_ever = current_best
                self.best_fitness_ever = current_best.fitness
                stagnation_counter = 0
            else:
                stagnation_counter += 1
            
            # 计算统计信息
            best_fitness = current_best.fitness
            avg_fitness = sum(ind.fitness for ind in population) / len(population)
            diversity = ga_engine._calculate_diversity(population)
            
            # 记录进化历史
            generation_stats = {
                'generation': generation,
                'best_fitness': best_fitness,
                'avg_fitness': avg_fitness,
                'diversity': diversity,
                'best_fitness_ever': self.best_fitness_ever,
                'stagnation_counter': stagnation_counter
            }
            self.evolution_history.append(generation_stats)
            
            # 显示进度（每10代显示一次）
            if generation % 10 == 0 or generation == generations - 1:
                print(f"第 {generation:3d} 代: "
                      f"最佳={best_fitness:6.2f}, "
                      f"平均={avg_fitness:6.2f}, "
                      f"多样={diversity:6.4f}, "
                      f"停滞={stagnation_counter:2d}")
            
            # 检查收敛条件
            if self._check_evolution_convergence(generation_stats):
                print(f"\\n🎯 在第 {generation} 代达到收敛条件")
                break
            
            # 检查停滞（连续30代无改进）
            if stagnation_counter >= 30:
                print(f"\\n⚠️ 连续 {stagnation_counter} 代未改进，进化结束")
                break
        
        print("=" * 60)
        print("🎉 进化完成")
        print("=" * 60)
        
        # 显示最终结果
        self._display_evolution_results()
        
        # 保存进化数据
        self._save_evolution_results(config, generations)
        
        return self.best_melody_ever
    
    def _check_evolution_convergence(self, stats: Dict) -> bool:
        """检查进化是否收敛"""
        # 1. 达到理论上的高适应度
        if stats['best_fitness'] > 0.90:  # 90分认为接近完美
            print(f"🎯 达到高适应度阈值: {stats['best_fitness']:.4f}")
            return True
        
        # 2. 连续多代适应度变化极小
        if len(self.evolution_history) > 20:
            recent_best = [h['best_fitness'] for h in self.evolution_history[-20:]]
            fitness_change = max(recent_best) - min(recent_best)
            if fitness_change < 0.001:  # 20代内变化小于0.001
                print(f"🎯 适应度变化极小: {fitness_change:.6f}")
                return True
        
        return False
    
    def _display_evolution_results(self):
        """显示进化结果"""
        if not self.evolution_history:
            return
        
        final_stats = self.evolution_history[-1]
        
        print(f"\\n📊 进化结果总结:")
        print(f"   🎵 最佳旋律适应度: {self.best_fitness_ever:.4f}")
        print(f"   📈 进化代数: {len(self.evolution_history)}")
        print(f"   📊 最终平均适应度: {final_stats['avg_fitness']:.4f}")
        print(f"   🔀 最终多样性: {final_stats['diversity']:.4f}")
        
        # 进化效率分析
        if len(self.evolution_history) > 1:
            total_improvement = self.best_fitness_ever - self.evolution_history[0]['best_fitness']
            improvement_rate = total_improvement / len(self.evolution_history)
            print(f"   ⚡ 进化效率: {total_improvement:.4f} / {len(self.evolution_history)} = {improvement_rate:.6f} 每代")
        
        # 收敛状态
        converged = final_stats['stagnation_counter'] >= 30
        print(f"   🎯 收敛状态: {'已收敛' if converged else '未完全收敛'}")
        
        # 最佳个体信息
        if self.best_melody_ever:
            gene_info = self.best_melody_ever.get_gene_info()
            print(f"   🧬 最佳个体基因数量: {len(gene_info.get('pitch_genes', []))}")
    
    def _save_evolution_results(self, config: MelodyConfig, max_generations: int):
        """保存进化结果"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"evolved_melody_{timestamp}.json"
        
        data = {
            'timestamp': timestamp,
            'config': {
                'emotion': config.emotion.value,
                'scale_type': config.scale.scale_type,
                'length': config.length,
                'tempo': config.tempo
            },
            'evolution_parameters': {
                'population_size': 50,
                'max_generations': max_generations,
                'elite_ratio': 0.1,
                'mutation_rate': 0.15
            },
            'results': {
                'best_fitness_ever': self.best_fitness_ever,
                'total_generations': len(self.evolution_history),
                'convergence_achieved': self.evolution_history[-1]['stagnation_counter'] >= 30 if self.evolution_history else False,
                'evolution_efficiency': self._calculate_evolution_efficiency()
            },
            'evolution_history': self.evolution_history,
            'best_melody_genes': self.best_melody_ever.get_gene_info() if self.best_melody_ever else None
        }
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        print(f"\\n💾 进化结果已保存到: {filename}")
    
    def _calculate_evolution_efficiency(self) -> float:
        """计算进化效率"""
        if len(self.evolution_history) < 2:
            return 0.0
        
        total_improvement = self.best_fitness_ever - self.evolution_history[0]['best_fitness']
        return total_improvement / len(self.evolution_history)


def run_emotion_based_evolution():
    """运行基于情感的多场景进化测试"""
    print("🎵 情感导向的进化旋律生成")
    print("=" * 60)
    
    # 不同情感的配置
    emotion_scenarios = [
        (EmotionType.HAPPY, "快乐情感", 32),
        (EmotionType.SAD, "悲伤情感", 32),
        (EmotionType.MYSTERIOUS, "神秘情感", 32),
        (EmotionType.NEUTRAL, "中性情感", 32)
    ]
    
    results = []
    
    for i, (emotion, name, length) in enumerate(emotion_scenarios):
        print(f"\\n🎭 场景 {i+1}: {name}")
        print("-" * 40)
        
        # 创建配置
        config = MelodyConfig(
            scale=ScaleFactory.create_scale(NoteName.C, "major"),
            emotion=emotion,
            length=length,
            tempo=120
        )
        
        # 创建优化器
        optimizer = MelodyEvolutionOptimizer()
        
        # 运行进化
        start_time = time.time()
        best_melody = optimizer.run_multi_generation_evolution(
            config=config,
            generations=50,  # 减少代数以加快测试
            population_size=30
        )
        end_time = time.time()
        
        # 记录结果
        result = {
            'scenario': name,
            'emotion': emotion.value,
            'best_fitness': best_melody.fitness,
            'total_generations': len(optimizer.evolution_history),
            'time_elapsed': end_time - start_time,
            'evolution_efficiency': optimizer._calculate_evolution_efficiency()
        }
        results.append(result)
        
        print(f"⏱️ 完成耗时: {end_time - start_time:.2f} 秒")
    
    # 显示比较结果
    print("\\n📊 场景比较结果")
    print("=" * 60)
    for result in results:
        print(f"{result['scenario']}:")
        print(f"  情感类型: {result['emotion']}")
        print(f"  最佳适应度: {result['best_fitness']:.4f}")
        print(f"  进化代数: {result['total_generations']}")
        print(f"  耗时: {result['time_elapsed']:.2f} 秒")
        print(f"  效率: {result['evolution_efficiency']:.6f} 每代")
        print()


def main():
    """主函数"""
    print("🧬 多代进化旋律生成器")
    print("=" * 60)
    
    # 创建配置 - 快乐情感，中等长度
    config = MelodyConfig(
        scale=ScaleFactory.create_scale(NoteName.C, "major"),
        emotion=EmotionType.HAPPY,
        length=32,
        tempo=120
    )
    
    # 创建优化器并运行进化
    optimizer = MelodyEvolutionOptimizer()
    
    print("🎵 开始进化快乐旋律...")
    best_melody = optimizer.run_multi_generation_evolution(
        config=config,
        generations=80,  # 80代进化
        population_size=40
    )
    
    print(f"\\n🎉 最终最佳旋律适应度: {best_melody.fitness:.4f}")
    print("🧬 进化迭代任务完成！")


if __name__ == "__main__":
    main()