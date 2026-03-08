import { useGameStore } from '@/lib/store/game.store';
import { Colors } from '@/lib/theme';
import { router } from 'expo-router';
import { useColorScheme } from 'nativewind';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const { width } = Dimensions.get('window');

const LEVEL_COUNT = 100;
const Y_SPACING = 120;
const X_AMPLITUDE = width * 0.3; // 30% of screen width to left and right
const X_CENTER = width / 2;
const MAP_HEIGHT = LEVEL_COUNT * Y_SPACING + 200; // Extra padding

interface LevelNode {
    id: number;
    x: number;
    y: number;
}

interface PathSegment {
    id: number;
    top: number;
    height: number;
    path: string;
}

interface LevelMapProps {
    /** The user's current level — highlights the active node. Defaults to 1. */
    currentLevel?: number;
}

export default function LevelMap({ currentLevel = 1 }: LevelMapProps) {
    const scrollViewRef = useRef<ScrollView>(null);
    const [nodes, setNodes] = useState<LevelNode[]>([]);
    const [segments, setSegments] = useState<PathSegment[]>([]);
    const [initialScrollDone, setInitialScrollDone] = useState(false);

    const generateBatch = useGameStore((s) => s.generateBatch);

    const { colorScheme } = useColorScheme();
    const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;
    const pathStroke = colorScheme === 'dark' ? '#444' : '#CBD5E1';
    const nodeBorder = colorScheme === 'dark' ? '#18181B' : '#E2E8F0';

    useEffect(() => {
        // Generate nodes
        const generatedNodes: LevelNode[] = [];
        const generatedSegments: PathSegment[] = [];

        for (let i = 1; i <= LEVEL_COUNT; i++) {
            // Modulate X using a sine wave to create the winding path.
            // Lower frequency makes the curves longer.
            const frequency = 0.5;
            const x = X_CENTER + Math.sin(i * frequency) * X_AMPLITUDE;

            // y goes from bottom to top.
            const y = MAP_HEIGHT - 100 - (i * Y_SPACING);

            generatedNodes.push({ id: i, x, y });

            if (i > 1) {
                // Curve to the next point
                const prevNode = generatedNodes[i - 2];
                const top = y;
                const height = prevNode.y - y;
                const PADDING = 20;

                const startX = prevNode.x;
                const startY = height + PADDING;
                const endX = x;
                const endY = PADDING;

                const controlY = (startY + endY) / 2;
                const pathString = `M ${startX} ${startY} C ${startX} ${controlY}, ${endX} ${controlY}, ${endX} ${endY}`;

                generatedSegments.push({
                    id: i,
                    top: top - PADDING,
                    height: height + PADDING * 2,
                    path: pathString,
                });
            }
        }

        setNodes(generatedNodes);
        setSegments(generatedSegments);
    }, []);

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <ScrollView
                ref={scrollViewRef}
                contentContainerStyle={{ height: MAP_HEIGHT, width }}
                showsVerticalScrollIndicator={false}
                // Use onLayout to reliably scroll to bottom once content is mounted
                onLayout={() => {
                    if (!initialScrollDone) {
                        scrollViewRef.current?.scrollToEnd({ animated: false });
                        setInitialScrollDone(true);
                    }
                }}
            >
                <View style={StyleSheet.absoluteFill}>
                    {segments.map((segment) => (
                        <Svg
                            key={`segment-${segment.id}`}
                            width={width}
                            height={segment.height}
                            style={{ position: 'absolute', top: segment.top, left: 0 }}
                        >
                            <Path
                                d={segment.path}
                                stroke={pathStroke}
                                strokeWidth={10}
                                strokeDasharray="20, 15"
                                fill="none"
                            />
                        </Svg>
                    ))}
                </View>

                {nodes.map((node) => {
                    const isCurrent = node.id === currentLevel;
                    const isCompleted = node.id < currentLevel;

                    // Determine colors based on state
                    let mainColor = colorScheme === 'dark' ? '#6B7280' : '#94A3B8'; // locked
                    let shadowColor = colorScheme === 'dark' ? '#374151' : '#64748B';
                    let textColor = '#FFFFFF';

                    if (isCurrent) {
                        mainColor = '#3B82F6'; // Blue
                        shadowColor = '#1D4ED8'; // Darker blue
                    } else if (isCompleted) {
                        mainColor = '#93C5FD'; // Lighter blue tint
                        shadowColor = '#60A5FA'; // Shadow for lighter blue
                        textColor = '#1E3A8A'; // Dark blue text for contrast
                    }

                    return (
                        <TouchableOpacity
                            key={node.id}
                            style={[
                                styles.nodeContainer,
                                { left: node.x - 30, top: node.y - 30 }
                            ]}
                            onPress={() => {
                                // Kick off question generation immediately — before the navigation
                                // animation plays — so questions are ready when game screen loads.
                                generateBatch(node.id);
                                router.push({ pathname: '/loading' as any, params: { level: node.id } });
                            }}
                            activeOpacity={0.8}
                        >
                            {/* Extrusion / Shadow layer */}
                            <View style={[styles.nodeShadow, { backgroundColor: shadowColor, borderColor: nodeBorder }]} />

                            {/* Main Top layer */}
                            <View style={[styles.levelNode, { backgroundColor: mainColor, borderColor: nodeBorder }]}>
                                <Text style={[styles.levelText, { color: textColor }]}>
                                    {node.id}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    nodeContainer: {
        position: 'absolute',
        width: 60,
        height: 68, // Extra height for shadow
        alignItems: 'center',
    },
    nodeShadow: {
        position: 'absolute',
        top: 8, // Offset downwards to create 3D effect
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 2,
        borderColor: '#18181B',
    },
    levelNode: {
        position: 'absolute',
        top: 0,
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 4,
        borderColor: '#18181B',
    },
    levelText: {
        fontSize: 20,
        fontWeight: '900',
    }
});
