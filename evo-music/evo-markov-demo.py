#!/usr/bin/env python3
"""
马尔可夫旋律引擎演示
展示基于马尔可夫链的智能旋律生成功能
"""

import sys
import os
import time
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from evo_music.melody import generate_melody, MarkovMelodyGenerator, MelodyConfig, EmotionType
from evo_music.scales import ScaleFactory
from evo_music.notes import NoteName
from evo_music.scales import ScaleType
from evo_music.midi_output import MIDIGenerator
import random


def demo_markov_melody_engine():
    """演示马尔可夫旋律引擎的完整功能"""
    print("🎵 马尔可夫旋律引擎演示")
    print("=" * 50)
    
    # 创建演示文件名列表
    demo_files = []
    
    # 1. 基本旋律生成演示
    print("\n🎼 1. 基本旋律生成（欢快风格）")
    melody1 = generate_melody(emotion="happy", length=20, start_note="C")
    print(f"   生成了 {len(melody1)} 个音符的欢快旋律")
    
    # 保存MIDI文件
    midi_gen1 = MIDIGenerator()
    notes1 = [state.note for state in melody1]
    durations1 = [state.duration for state in melody1]
    midi_gen1.add_melody(notes1, durations1)
    midi_gen1.save("demo_happy_melody.mid")
    demo_files.append("demo_happy_melody.mid")
    
    # 2. 多情感旋律生成演示
    print("\n😊 2. 多情感旋律对比")
    emotions = ["happy", "sad", "mysterious", "epic", "peaceful"]
    emotion_files = []
    
    for emotion in emotions:
        melody = generate_melody(emotion=emotion, length=16, start_note="C")
        
        # 分析特征
        notes = [state.note.value + state.octave * 12 for state in melody]
        min_note = min(notes)
        max_note = max(notes)
        avg_velocity = sum(s.velocity for s in melody) / len(melody)
        
        print(f"   {emotion:10}: 音域 {min_note:3d}-{max_note:3d}, 平均力度 {avg_velocity:.1f}")
        
        # 保存每个情感的旋律
        midi_gen = MIDIGenerator()
        midi_gen.add_melody([state.note for state in melody], [state.duration for state in melody])
        filename = f"demo_{emotion}_melody.mid"
        midi_gen.save(filename)
        emotion_files.append(filename)
    
    demo_files.extend(emotion_files)
    
    # 3. 高级自定义配置演示
    print("\n⚙️  3. 高级自定义配置演示")
    
    # 创建自定义音阶和配置
    scale = ScaleFactory.create_scale(NoteName.C, ScaleType.MAJOR)
    config = MelodyConfig(
        scale=scale,
        emotion=EmotionType.HAPPY,
        length=24,
        start_note=NoteName.G,
        start_octave=4,
        tempo=140,
        max_leap=6,
        climax_position=0.75,
        use_dynamics=True,
        duration_variety=0.9
    )
    
    # 使用自定义生成器
    generator = MarkovMelodyGenerator(config)
    custom_melody = generator.generate()
    
    print(f"   自定义配置: G大调，长度24，速度140，高潮位置75%")
    print(f"   生成了 {len(custom_melody)} 个音符")
    
    # 分析自定义旋律特征
    notes = [state.note.value + state.octave * 12 for state in custom_melody]
    min_note = min(notes)
    max_note = max(notes)
    climax_note = custom_melody[int(len(custom_melody) * 0.75)]
    
    print(f"   实际音域: {min_note} - {max_note}")
    print(f"   高潮音符: {climax_note.note.name}{climax_note.octave} (力度: {climax_note.velocity})")
    
    # 保存自定义旋律
    midi_gen_custom = MIDIGenerator()
    midi_gen_custom.add_melody([state.note for state in custom_melody], [state.duration for state in custom_melody])
    midi_gen_custom.save("demo_custom_melody.mid")
    demo_files.append("demo_custom_melody.mid")
    
    # 4. 马尔可夫链可视化演示
    print("\n📊 4. 转换概率矩阵可视化")
    
    # 简单显示转换概率
    generator = MarkovMelodyGenerator(config)
    matrix = generator.transition_matrix
    
    print("   音符转换概率矩阵（部分）:")
    scale_notes = config.scale.notes[:5]  # 只显示前5个音符
    for i, from_note in enumerate(scale_notes):
        for j, to_note in enumerate(scale_notes):
            prob = matrix.note_probabilities.get((from_note.value, to_note.value), 0)
            if prob > 0.01:  # 只显示概率>1%的转换
                print(f"     {from_note.name} → {to_note.name}: {prob:.3f}")
    
    # 5. 批量生成和统计分析
    print("\n📈 5. 批量生成和统计分析")
    
    # 生成10个欢快旋律进行分析
    melodies = []
    for i in range(10):
        melody = generate_melody(emotion="happy", length=16, start_note="C")
        melodies.append(melody)
    
    # 统计分析
    all_velocities = []
    all_ranges = []
    
    for melody in melodies:
        velocities = [state.velocity for state in melody]
        notes = [state.note.value + state.octave * 12 for state in melody]
        
        all_velocities.extend(velocities)
        all_ranges.append(max(notes) - min(notes))
    
    print(f"   生成 {len(melodies)} 个旋律样本")
    print(f"   平均力度: {sum(all_velocities) / len(all_velocities):.1f}")
    print(f"   平均音域: {sum(all_ranges) / len(all_ranges):.1f} 个半音")
    
    return demo_files


def demo_interactive_generation():
    """交互式旋律生成演示"""
    print("\n🎮 交互式旋律生成演示")
    print("   快速生成几个不同风格的旋律片段:")
    
    styles = {
        "中国风": "chinese",
        "布鲁斯": "blues", 
        "神秘": "mysterious",
        "史诗": "epic",
        "宁静": "peaceful"
    }
    
    files_created = []
    
    for style_name, emotion in styles.items():
        melody = generate_melody(emotion=emotion, length=12, start_note="D")
        
        print(f"\n   {style_name}风格 ({emotion}):")
        for i, state in enumerate(melody[:4]):  # 只显示前4个音符
            print(f"     {i+1}. {state.note.name}{state.octave} - {state.duration:.2f}拍")
        
        # 保存短旋律
        midi_gen = MIDIGenerator()
        midi_gen.add_melody([state.note for state in melody], [state.duration for state in melody])
        filename = f"demo_{emotion}_short.mid"
        midi_gen.save(filename)
        files_created.append(filename)
    
    return files_created


def main():
    """主演示函数"""
    print("🎯 开始马尔可夫旋律引擎完整演示")
    print("=" * 60)
    
    try:
        # 主要演示
        demo_files = demo_markov_melody_engine()
        
        # 交互式演示
        interactive_files = demo_interactive_generation()
        
        # 合并所有生成的文件
        all_files = demo_files + interactive_files
        
        # 显示总结
        print("\n🎉 演示完成！")
        print("=" * 60)
        print(f"📁 总共生成了 {len(all_files)} 个MIDI演示文件:")
        
        for file in sorted(all_files):
            size = os.path.getsize(file) if os.path.exists(file) else 0
            print(f"   🎵 {file} ({size} bytes)")
        
        print(f"\n✨ 马尔可夫旋律引擎功能验证:")
        print("   ✓ 基本旋律生成")
        print("   ✓ 多情感支持")
        print("   ✓ 自定义配置")
        print("   ✓ 转换矩阵分析")
        print("   ✓ 批量统计分析")
        print("   ✓ MIDI输出")
        
        # 生成总结报告
        report = f"""
马尔可夫旋律引擎演示报告
========================

时间: {time.strftime('%Y-%m-%d %H:%M:%S')}
演示文件数: {len(all_files)}

功能验证:
1. 基本旋律生成 - 成功
2. 多情感支持 (happy, sad, mysterious, epic, peaceful) - 成功
3. 自定义配置 - 成功
4. 转换矩阵可视化 - 成功
5. 批量统计分析 - 成功
6. MIDI输出 - 成功

引擎特点:
- 基于马尔可夫链的音符转移概率
- 支持多种情感和音阶
- 动态力度和时值控制
- 高潮位置智能布局
- 音域和跳跃限制

生成的MIDI文件:
"""
        for file in sorted(all_files):
            report += f"- {file}\n"
        
        # 保存报告
        with open("demo_report.md", "w", encoding="utf-8") as f:
            f.write(report)
        
        print(f"\n📄 详细报告已保存: demo_report.md")
        print("🎯 演示结束，所有功能正常！")
        
        return True
        
    except Exception as e:
        print(f"\n❌ 演示过程中出现错误: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = main()
    if success:
        print("\n✅ 马尔可夫旋律引擎实现完成")
    else:
        print("\n❌ 演示失败")