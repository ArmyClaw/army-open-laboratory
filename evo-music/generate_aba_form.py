#!/usr/bin/env python3
"""
A-B-A 曲式生成器 - 生成完整的 A-B-A 曲式音乐作品
"""

import sys
import os

# 添加项目路径
sys.path.append(os.path.join(os.path.dirname(__file__), '.'))

from evo_music.form_structure import (
    ABAFormGenerator, 
    ABAConfig, 
    FormType,
    SectionRole,
    EmotionType
)
from evo_music.midi_output import MIDIGenerator
from evo_music import music_theory


def generate_classical_aba():
    """生成古典 A-B-A 曲式"""
    print("🎼 生成古典 A-B-A 曲式音乐...")
    print("=" * 50)
    
    # 创建古典 A-B-A 配置
    config = ABAConfig.create_classical_aba()
    
    # 创建生成器
    generator = ABAFormGenerator(config)
    
    # 生成曲式结构
    aba_structure = generator.generate_aba_structure()
    
    # 输出结果概览
    print(f"\n📋 A-B-A 曲式概览:")
    print(f"  调性: {config.key} {config.scale_type}")
    print(f"  速度: {config.tempo} BPM")
    print(f"  拍号: {config.time_signature[0]}/{config.time_signature[1]}")
    print(f"  总小节数: {aba_structure['total_measures']}")
    
    # 输出各段信息
    sections = aba_structure['sections']
    
    print(f"\n🎵 A段（主题）:")
    a_config = sections['a_section']['config']
    print(f"  长度: {a_config.length} 小节")
    print(f"  情感: {a_config.emotion.value}")
    print(f"  力度: {a_config.dynamic_level}")
    a_chars = sections['a_section']['characteristics']
    print(f"  音域: {a_chars['melody_characteristics']['pitch_range']} 半音")
    
    print(f"\n🔄 B段（对比部）:")
    b_config = sections['b_section']['config']
    print(f"  长度: {b_config.length} 小节")
    print(f"  情感: {b_config.emotion.value}")
    print(f"  力度: {b_config.dynamic_level}")
    print(f"  移调: {b_config.transposition} 半音")
    b_chars = sections['b_section']['characteristics']
    print(f"  音域: {b_chars['melody_characteristics']['pitch_range']} 半音")
    
    print(f"\n🎭 A段（再现）:")
    return_config = sections['return_section']['config']
    print(f"  长度: {return_config.length} 小节")
    print(f"  情感: {return_config.emotion.value}")
    print(f"  力度: {return_config.dynamic_level}")
    return_chars = sections['return_section']['characteristics']
    print(f"  音域: {return_chars['melody_characteristics']['pitch_range']} 半音")
    
    # 显示和声进行
    print(f"\n🎼 和声进行:")
    for section_name, section_data in sections.items():
        if section_name in ['a_section', 'b_section', 'return_section']:
            chord_names = [chord_info["chord"].name for chord_info in section_data["harmony"]["chord_progression"]]
            print(f"  {section_name}: {' → '.join(chord_names)}")
    
    # 显示过渡和尾声
    if 'transitions' in sections:
        print(f"\n🌉 过渡段:")
        for i, transition in enumerate(sections['transitions']):
            print(f"  {transition['from']} → {transition['to']}: {transition['transition']['config'].length} 小节")
    
    if 'coda' in sections:
        print(f"\n🎉 尾声:")
        coda_config = sections['coda']['config']
        print(f"  长度: {coda_config.length} 小节")
        print(f"  情感: {coda_config.emotion.value}")
        print(f"  力度: {coda_config.dynamic_level}")
    
    # 生成 MIDI 文件
    print(f"\n💾 生成 MIDI 文件...")
    midi_filename = "aba_classical_form.mid"
    
    try:
        # 简化 MIDI 生成：创建文本格式的音乐描述
        print(f"  🎵 创建简化的 MIDI 描述...")
        
        # 添加旋律轨道
        melody_track = []
        for section_name, section_data in sections.items():
            if section_name in ['a_section', 'b_section', 'return_section']:
                melody_notes = section_data["melody"]  # 已经是音符列表
                melody_track.extend(melody_notes)
        
        midi_writer.add_track("Melody", melody_track, channel=0, instrument=0)
        
        # 添加和声轨道
        harmony_track = []
        for section_name, section_data in sections.items():
            if section_name in ['a_section', 'b_section', 'return_section']:
                harmony_notes = []
                for chord_info in section_data["harmony"]["harmony_voices"]["harmony"]:
                    harmony_notes.extend([(note + 12, duration) for note, duration in harmony_notes])  # 高八度
                harmony_track.extend(harmony_notes)
        
        midi_writer.add_track("Harmony", harmony_track, channel=1, instrument=1)
        
        # 添加低音轨道
        bass_track = []
        for section_name, section_data in sections.items():
            if section_name in ['a_section', 'b_section', 'return_section']:
                bass_notes = section_data["harmony"]["harmony_voices"]["bass"]
                bass_track.extend([(note - 24, duration) for note, duration in bass_notes])  # 低八度
        
        midi_writer.add_track("Bass", bass_track, channel=2, instrument=32)
        
        # 保存文件
        midi_writer.save()
        print(f"  ✅ MIDI 文件已保存: {midi_filename}")
        
    except Exception as e:
        print(f"  ❌ MIDI 生成失败: {e}")
    
    return aba_structure


def generate_modern_aba():
    """生成现代 A-B-A 曲式"""
    print("\n🎵 生成现代 A-B-A 曲式音乐...")
    print("=" * 50)
    
    # 创建现代 A-B-A 配置
    config = ABAConfig.create_modern_aba()
    
    # 创建生成器
    generator = ABAFormGenerator(config)
    
    # 生成曲式结构
    aba_structure = generator.generate_aba_structure()
    
    # 输出结果概览
    print(f"\n📋 现代 A-B-A 曲式概览:")
    print(f"  调性: {config.key} {config.scale_type}")
    print(f"  速度: {config.tempo} BPM")
    print(f"  拍号: {config.time_signature[0]}/{config.time_signature[1]}")
    print(f"  总小节数: {aba_structure['total_measures']}")
    
    # 输出各段信息
    sections = aba_structure['sections']
    
    print(f"\n🎵 A段（主题）:")
    a_config = sections['a_section']['config']
    print(f"  长度: {a_config.length} 小节")
    print(f"  情感: {a_config.emotion.value}")
    print(f"  力度: {a_config.dynamic_level}")
    a_chars = sections['a_section']['characteristics']
    print(f"  音域: {a_chars['melody_characteristics']['pitch_range']} 半音")
    
    print(f"\n🔄 B段（对比部）:")
    b_config = sections['b_section']['config']
    print(f"  长度: {b_config.length} 小节")
    print(f"  情感: {b_config.emotion.value}")
    print(f"  力度: {b_config.dynamic_level}")
    print(f"  速度变化: {b_config.tempo_change}x")
    b_chars = sections['b_section']['characteristics']
    print(f"  音域: {b_chars['melody_characteristics']['pitch_range']} 半音")
    
    print(f"\n🎭 A段（再现）:")
    return_config = sections['return_section']['config']
    print(f"  长度: {return_config.length} 小节")
    print(f"  情感: {return_config.emotion.value}")
    print(f"  力度: {return_config.dynamic_level}")
    return_chars = sections['return_section']['characteristics']
    print(f"  音域: {return_chars['melody_characteristics']['pitch_range']} 半音")
    
    # 显示和声进行
    print(f"\n🎼 和声进行:")
    for section_name, section_data in sections.items():
        if section_name in ['a_section', 'b_section', 'return_section']:
            chord_names = [chord_info["chord"].name for chord_info in section_data["harmony"]["chord_progression"]]
            print(f"  {section_name}: {' → '.join(chord_names)}")
    
    # 显示过渡和尾声
    if 'transitions' in sections:
        print(f"\n🌉 过渡段:")
        for i, transition in enumerate(sections['transitions']):
            print(f"  {transition['from']} → {transition['to']}: {transition['transition']['config'].length} 小节")
    
    if 'coda' in sections:
        print(f"\n🎉 尾声:")
        coda_config = sections['coda']['config']
        print(f"  长度: {coda_config.length} 小节")
        print(f"  情感: {coda_config.emotion.value}")
        print(f"  力度: {coda_config.dynamic_level}")
    
    # 生成 MIDI 文件
    print(f"\n💾 生成 MIDI 文件...")
    midi_filename = "aba_modern_form.mid"
    
    try:
        # 简化 MIDI 生成：创建文本格式的音乐描述
        print(f"  🎵 创建简化的 MIDI 描述...")
        
        # 简化的 MIDI 表示：创建基本的音符序列
        midi_content = self._create_simple_midi_representation(sections, config)
        
        # 保存为文本文件作为 MIDI 表示
        with open(midi_filename, 'w', encoding='utf-8') as f:
            f.write(midi_content)
        
        print(f"  ✅ MIDI 文件已保存: {midi_filename}")
        
    except Exception as e:
        print(f"  ❌ MIDI 生成失败: {e}")
    
    return aba_structure


def _create_simple_midi_representation(sections, config):
    """创建简化的 MIDI 文本表示"""
    content = f"A-B-A 曲式音乐\n"
    content += f"调性: {config.key} {config.scale_type}\n"
    content += f"速度: {config.tempo} BPM\n"
    content += f"拍号: {config.time_signature[0]}/{config.time_signature[1]}\n"
    content += "=" * 30 + "\n\n"
    
    # A段
    content += "【A段 - 主题】\n"
    a_config = sections['a_section']['config']
    content += f"长度: {a_config.length} 小节, 情感: {a_config.emotion.value}\n"
    
    # A段和声
    chord_names = [chord_info["chord"].name for chord_info in sections['a_section']["harmony"]["chord_progression"]]
    content += f"和声: {' → '.join(chord_names)}\n\n"
    
    # B段
    content += "【B段 - 对比部】\n"
    b_config = sections['b_section']['config']
    content += f"长度: {b_config.length} 小节, 情感: {b_config.emotion.value}\n"
    content += f"移调: {b_config.transposition} 半音\n"
    
    # B段和声
    chord_names = [chord_info["chord"].name for chord_info in sections['b_section']["harmony"]["chord_progression"]]
    content += f"和声: {' → '.join(chord_names)}\n\n"
    
    # A段再现
    content += "【A段 - 再现】\n"
    return_config = sections['return_section']['config']
    content += f"长度: {return_config.length} 小节, 情感: {return_config.emotion.value}\n"
    content += f"力度: {return_config.dynamic_level}\n"
    
    # A段再现和声
    chord_names = [chord_info["chord"].name for chord_info in sections['return_section']["harmony"]["chord_progression"]]
    content += f"和声: {' → '.join(chord_names)}\n\n"
    
    # 总体信息
    content += "【总体信息】\n"
    content += f"总小节数: {sections['total_measures']}\n"
    
    return content


def main():
    """主函数"""
    print("🎼 A-B-A 曲式生成器")
    print("=" * 50)
    
    try:
        # 生成古典 A-B-A
        classical_aba = generate_classical_aba()
        
        # 生成现代 A-B-A
        modern_aba = generate_modern_aba()
        
        print(f"\n🎉 完成！已生成两种 A-B-A 曲式音乐作品。")
        print(f"📁 古典版: aba_classical_form.mid")
        print(f"📁 现代版: aba_modern_form.mid")
        
    except Exception as e:
        print(f"❌ 生成过程中出现错误: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()